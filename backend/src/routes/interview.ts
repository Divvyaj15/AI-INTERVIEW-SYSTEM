
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { llmCallJSON } from '../services/llm.service.js'
import { synthesizeSpeech } from '../services/tts.service.js'
import { transcribeAudio } from '../services/stt.service.js'
import { buildGreetingPrompt } from '../prompts/greeting.js'
import { buildNextQuestionPrompt } from '../prompts/nextQuestion.js'
import { buildEvaluateAnswerPrompt } from '../prompts/evaluateAnswer.js'
import { embedAndStoreInterviewTurn } from '../rag/embedder.js'
import { buildQuestionContext, formatContextForLLM } from '../rag/contextBuilder.js'
import { supabase } from '../lib/supabase.js'
import type { 
  StartResponse, 
  AnswerResponse,
  LLMEvaluationResult
} from '../types/index.js'

export const interviewRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// ── GET /interview/:id/start ──────────────────────────────────────────────────
interviewRouter.get('/:id/start', authMiddleware, async (req, res, next) => {
  try {
    const interviewId = req.params.id as string

    const { data: interview, error: intError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single()

    if (intError || !interview) throw createError('Interview not found', 404)

    const jobTitle = interview.job_description.split('\n')[0].slice(0, 80)
    const maxQuestions = interview.max_questions ?? 5

    const { system, user } = buildGreetingPrompt({
      candidateName: interview.candidate_name ?? interview.resume_highlights?.split('\n')[0] ?? 'Candidate',
      jobTitle,
      companyContext: interview.resume_highlights ?? '',
    })

    const voiceId = (req.query.voiceId as string) || undefined

    const greetingResult = await llmCallJSON<{ greeting: string }>(user, system)
    const greetingText = greetingResult.greeting
    const audioBase64 = await synthesizeSpeech(greetingText, voiceId)

    // Use the greeting text as the first question so the verbal audio matches the on-screen text
    const firstQuestionId = uuid()
    await supabase.from('questions').insert({
      id: firstQuestionId,
      interview_id: interviewId,
      question_text: greetingText,
      order_index: 0,
      topic: 'introduction',
    })

    res.json({
      greeting: greetingText,
      audioBase64,
      firstQuestion: greetingText,
      questionId: firstQuestionId,
    } as StartResponse)
  } catch (err) {
    next(err)
  }
})

// ── POST /interview/:id/answer ────────────────────────────────────────────────
interviewRouter.post('/:id/answer', authMiddleware, upload.single('audio'), async (req, res, next) => {
  try {
    const interviewId = req.params.id as string
    const questionId = req.body.questionId as string
    const transcriptOverride = req.body.transcriptOverride as string | undefined
    const voiceId = req.body.voiceId as string | undefined

    const { data: interview, error: intError } = await supabase
      .from('interviews')
      .select('*, questions(*)')
      .eq('id', interviewId)
      .single()

    if (intError || !interview) throw createError('Interview not found', 404)

    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (qError || !question) throw createError('Question not found', 404)

    let transcript = transcriptOverride || ''

    // 1. MASSIVE SPEEDUP: Parallelize STT, Context Retrieval, and DB Counting
    const [sttResult, context, countResult] = await Promise.all([
      (!transcript.trim() && req.file)
        ? transcribeAudio(req.file.buffer, req.file.mimetype)
        : Promise.resolve({ transcript }),
      buildQuestionContext(interviewId, (question.topic ?? question.question_text) as string),
      supabase.from('evaluations').select('id', { count: 'exact', head: true }).eq('interview_id', interviewId)
    ])

    transcript = sttResult.transcript
    if (!transcript.trim()) throw createError('No transcript could be produced', 422)

    const jobTitle = interview.job_description.split('\n')[0].slice(0, 80)
    const maxQuestions = interview.max_questions ?? 5

    // countResult gives the count BEFORE we insert the current evaluation
    const answeredCount = (countResult.count ?? 0) + 1
    const isComplete = answeredCount >= maxQuestions

    const ragContext = formatContextForLLM(context)

    const { system: eSys, user: eUser } = buildEvaluateAnswerPrompt({
      question: question.question_text,
      answer: transcript,
      ragContext,
      jobTitle,
      questionType: question.topic ?? 'general',
    })

    const evaluation = await llmCallJSON<LLMEvaluationResult>(eUser, eSys, { temperature: 0.3 })

    // FIRE AND FORGET: Don't make the user wait for DB inserts
    supabase.from('evaluations').insert({
      id: uuid(),
      question_id: questionId,
      interview_id: interviewId,
      answer_text: transcript,
      score: evaluation.score,
      feedback: evaluation.feedback,
      criteria_scores: evaluation.criteriaScores,
      competency_assessment: evaluation.competencyAssessment,
    }).then(({ error }) => {
      if (error) console.error('[Answer] Eval insert error:', error.message)
    })

    embedAndStoreInterviewTurn({
      interviewId,
      questionText: question.question_text as string,
      answerText: transcript,
      score: evaluation.score as number,
    }).catch(e => console.warn('[Answer] Turn embedding error:', e))

    let nextQuestion: string | null = null
    let nextQuestionId: string | null = null
    let audioBase64: string | null = null

    if (!isComplete) {
      const nextContext = await buildQuestionContext(interviewId, evaluation.nextQuestionTopic as string)
      const nextRagContext = formatContextForLLM(nextContext)

      const { system: qSys, user: qUser } = buildNextQuestionPrompt({
        ragContext: nextRagContext,
        questionNumber: answeredCount + 1,
        totalQuestions: maxQuestions,
        previousTopic: question.topic,
        jobTitle,
      })

      const nextQuestionData = await llmCallJSON<{ question: string; topic: string }>(qUser, qSys)
      nextQuestionId = uuid()
      nextQuestion = nextQuestionData.question

      // FIRE AND FORGET Next Question Insert
      supabase.from('questions').insert({
        id: nextQuestionId,
        interview_id: interviewId,
        question_text: nextQuestion,
        order_index: answeredCount,
        topic: nextQuestionData.topic,
      }).then(({ error }) => {
        if (error) console.error('[Answer] Question insert error:', error.message)
      })

      audioBase64 = await synthesizeSpeech(`${evaluation.feedback} Now, ${nextQuestion}`, voiceId)
    } else {
      audioBase64 = await synthesizeSpeech(`Excellent job. You have completed the session.`, voiceId)
    }

    res.json({
      transcript,
      score: evaluation.score,
      feedback: evaluation.feedback,
      nextQuestion,
      nextQuestionId,
      audioBase64,
      isComplete,
      criteriaScores: evaluation.criteriaScores,
    } as AnswerResponse)
  } catch (err) {
    next(err)
  }
})