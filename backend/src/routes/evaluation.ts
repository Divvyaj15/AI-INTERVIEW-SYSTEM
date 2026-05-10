import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { llmCall } from '../services/llm.service.js'
import { getOverallScore, scoreToGrade, scoreToMarketPosition } from '../services/evaluation.service.js'
import { buildFinalReportPrompt, buildFinalThanksPrompt } from '../prompts/finalReport.js'
import { synthesizeSpeech } from '../services/tts.service.js'
import { supabase } from '../lib/supabase.js'
import type { ResultsResponse } from '../types/index.js'

export const evaluationRouter = Router()

// ── POST /evaluation/:interviewId/complete ────────────────────────────────────
evaluationRouter.post('/:interviewId/complete', authMiddleware, async (req, res, next) => {
  try {
    const { interviewId } = z.object({ interviewId: z.string().uuid() }).parse(req.params)

    // Verify ownership
    const { data: interview, error: iErr } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('candidate_id', req.user!.id)
      .single()

    if (iErr || !interview) throw createError('Interview not found', 404)
    if (interview.status === 'completed') throw createError('Interview already completed', 400)

    // Compute overall score
    const overallScore = await getOverallScore(interviewId)

    // Fetch all evaluations with questions for the report
    const { data: evalData, error: eErr } = await supabase
      .from('evaluations')
      .select('*, questions(question_text, topic, order_index)')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: true })

    if (eErr) throw createError(`Failed to fetch evaluations: ${eErr.message}`, 500)

    // Build evaluation summary for the final report prompt
    const evalSummary = (evalData ?? [])
      .map((e: any, i: number) =>
        `Q${i + 1} [${e.questions?.topic ?? 'general'}]: ${e.questions?.question_text}\n` +
        `Score: ${e.score}/100 — ${e.feedback}`
      )
      .join('\n\n')

    // Generate final report
    const candidateName = interview.resume_highlights?.split(' ')[0] ?? 'Candidate'
    const jobTitle = interview.job_description.split('\n')[0].slice(0, 80)

    const { system: rSys, user: rUser } = buildFinalReportPrompt({
      candidateName,
      jobTitle,
      overallScore,
      evaluationSummary: evalSummary,
      resumeHighlights: interview.resume_highlights ?? '',
    })

    const finalReport = await llmCall(rUser, rSys, { temperature: 0.4, maxTokens: 600 })

    const voiceId = req.body?.voiceId as string | undefined

    // Generate closing audio
    const { system: tSys, user: tUser } = buildFinalThanksPrompt(candidateName)
    const thanksText = await llmCall(tUser, tSys, { temperature: 0.7, maxTokens: 100 })
    const closingAudio = await synthesizeSpeech(thanksText, voiceId)

    // Persist results
    await supabase
      .from('interviews')
      .update({
        status: 'completed',
        overall_score: overallScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interviewId)

    res.json({
      overallScore,
      grade: scoreToGrade(overallScore),
      marketPosition: scoreToMarketPosition(overallScore),
      finalReport,
      closingAudio,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /evaluation/:interviewId/results ──────────────────────────────────────
evaluationRouter.get('/:interviewId/results', authMiddleware, async (req, res, next) => {
  try {
    const { interviewId } = z.object({ interviewId: z.string().uuid() }).parse(req.params)

    // Fetch interview
    const { data: interview, error: iErr } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('candidate_id', req.user!.id)
      .single()

    if (iErr || !interview) throw createError('Interview not found', 404)

    // Fetch questions + evaluations joined
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*, evaluations(*)')
      .eq('interview_id', interviewId)
      .order('order_index', { ascending: true })

    if (qErr) throw createError(`Failed to fetch results: ${qErr.message}`, 500)

    const evaluations = (questions ?? []).map((q: any) => ({
      question: {
        id: q.id,
        interview_id: q.interview_id,
        question_text: q.question_text,
        order_index: q.order_index,
        topic: q.topic,
        created_at: q.created_at,
      },
      evaluation: q.evaluations?.[0] ?? null,
    }))

    const response: ResultsResponse = {
      interview,
      evaluations,
      overallScore: interview.overall_score ?? 0,
      finalReport: '',
    }

    res.json(response)
  } catch (err) {
    next(err)
  }
})