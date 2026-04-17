
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { llmCallJSON } from '../services/llm.service.js'
import { synthesizeSpeech } from '../services/tts.service.js'
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
    const interviewId = req.params.id

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

    const greetingResult = await llmCallJSON<{ greeting: string }>(user, system)
    const greetingText = greetingResult.greeting
    const audioBase64 = await synthesizeSpeech(greetingText)

    const context = await buildQuestionContext(interviewId, 'introduction')
    const ragContext = formatContextForLLM(context)

    const { system: qSys, user: qUser } = buildNextQuestionPrompt({
      ragContext,
      questionNumber: 1,
      totalQuestions: maxQuestions,
      previousTopic: null,
      jobTitle,
    })

    const firstQuestionData = await llmCallJSON<{
      question: string
      topic: string
    }>(qUser, qSys, { temperature: 0.7 })

    const firstQuestionId = uuid()
    await supabase.from('questions').insert({
      id: firstQuestionId,
      interview_id: interviewId,
      question_text: firstQuestionData.question,
      order_index: 0,
      topic: firstQuestionData.topic,
    })

    res.json({
      greeting: greetingText,
      audioBase64,
      firstQuestion: firstQuestionData.question,
      questionId: firstQuestionId,
    } as StartResponse)
  } catch (err) {
    next(err)
  }
})

// ── POST /interview/:id/answer ────────────────────────────────────────────────
interviewRouter.post('/:id/answer', authMiddleware, upload.single('audio'), async (req, res, next) => {
  try {
    const interviewId = req.params.id
    const { questionId, transcriptOverride } = req.body

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

    const transcript = transcriptOverride || ''
    if (!transcript.trim()) throw createError('No transcript could be produced', 422)

    const jobTitle = interview.job_description.split('\n')[0].slice(0, 80)
    const maxQuestions = interview.max_questions ?? 5

    const context = await buildQuestionContext(interviewId, question.topic ?? question.question_text)
    const ragContext = formatContextForLLM(context)

    const { system: eSys, user: eUser } = buildEvaluateAnswerPrompt({
      question: question.question_text,
      answer: transcript,
      ragContext,
      jobTitle,
      questionType: question.topic ?? 'general',
    })

    const evaluation = await llmCallJSON<LLMEvaluationResult>(eUser, eSys, { temperature: 0.3 })

    await supabase.from('evaluations').insert({
      id: uuid(),
      question_id: questionId,
      interview_id: interviewId,
      answer_text: transcript,
      score: evaluation.score,
      feedback: evaluation.feedback,
      criteria_scores: evaluation.criteriaScores,
      competency_assessment: evaluation.competencyAssessment,
    })

    embedAndStoreInterviewTurn({
      interviewId,
      questionText: question.question_text,
      answerText: transcript,
      score: evaluation.score,
    }).catch(e => console.warn('[Answer] Turn embedding error:', e))

    const { count } = await supabase
      .from('evaluations')
      .select('id', { count: 'exact', head: true })
      .eq('interview_id', interviewId)

    const answeredCount = count ?? 0
    const isComplete = answeredCount >= maxQuestions

    let nextQuestion: string | null = null
    let nextQuestionId: string | null = null
    let audioBase64: string | null = null

    if (!isComplete) {
      const nextContext = await buildQuestionContext(interviewId, evaluation.nextQuestionTopic)
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

      await supabase.from('questions').insert({
        id: nextQuestionId,
        interview_id: interviewId,
        question_text: nextQuestion,
        order_index: answeredCount + 1,
        topic: nextQuestionData.topic,
      })

      audioBase64 = await synthesizeSpeech(`${evaluation.feedback} Now, ${nextQuestion}`)
    } else {
      audioBase64 = await synthesizeSpeech(`Excellent job. You have completed the session.`)
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