import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { llmCall, llmCallJSON } from '../services/llm.service.js';
import { transcribeAudio } from '../services/stt.service.js';
import { synthesizeSpeech } from '../services/tts.service.js';
import { buildGreetingPrompt } from '../prompts/greeting.js';
import { buildNextQuestionPrompt } from '../prompts/nextQuestion.js';
import { buildEvaluateAnswerPrompt } from '../prompts/evaluateAnswer.js';
import { buildQuestionContext, formatContextForLLM } from '../rag/contextBuilder.js';
import { embedAndStoreInterviewTurn } from '../rag/embedder.js';
import { supabase } from '../lib/supabase.js';
import { v4 as uuid } from 'uuid';
export const interviewRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const TOTAL_QUESTIONS = 6;
// ── GET /interview/:id/start ──────────────────────────────────────────────────
interviewRouter.get('/:id/start', authMiddleware, async (req, res, next) => {
    try {
        const { id: interviewId } = z.object({ id: z.string().uuid() }).parse(req.params);
        // Fetch interview record
        const { data: interview, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', interviewId)
            .eq('candidate_id', req.user.id)
            .single();
        if (error || !interview)
            throw createError('Interview not found', 404);
        if (interview.status === 'completed')
            throw createError('Interview already completed', 400);
        // Extract job title from JD (first line or fallback)
        const jobTitle = interview.job_description.split('\n')[0].slice(0, 80);
        // Generate greeting
        const { system, user } = buildGreetingPrompt({
            candidateName: interview.resume_highlights?.split(' ')[0] ?? 'there',
            jobTitle,
            companyContext: interview.job_description.slice(0, 300),
        });
        const greeting = await llmCall(user, system, { temperature: 0.8, maxTokens: 200 });
        // Generate first question using RAG
        const context = await buildQuestionContext(interviewId, 'introduction experience background');
        const ragContext = formatContextForLLM(context);
        const { system: qSys, user: qUser } = buildNextQuestionPrompt({
            ragContext,
            questionNumber: 1,
            totalQuestions: TOTAL_QUESTIONS,
            previousTopic: null,
            jobTitle,
        });
        const firstQuestionData = await llmCallJSON(qUser, qSys, { temperature: 0.7 });
        // Save first question to DB
        const questionId = uuid();
        await supabase.from('questions').insert({
            id: questionId,
            interview_id: interviewId,
            question_text: firstQuestionData.question,
            order_index: 1,
            topic: firstQuestionData.topic,
        });
        // Update interview status
        await supabase.from('interviews').update({ status: 'in_progress' }).eq('id', interviewId);
        // Synthesize greeting + first question as audio
        const fullScript = `${greeting}\n\nFor our first question: ${firstQuestionData.question}`;
        const audioBase64 = await synthesizeSpeech(fullScript);
        const response = {
            greeting,
            audioBase64,
            firstQuestion: firstQuestionData.question,
            questionId,
        };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
});
// ── POST /interview/:id/answer ────────────────────────────────────────────────
interviewRouter.post('/:id/answer', authMiddleware, upload.single('audio'), async (req, res, next) => {
    try {
        const { id: interviewId } = z.object({ id: z.string().uuid() }).parse(req.params);
        const { questionId, transcriptOverride } = z
            .object({
            questionId: z.string().uuid(),
            transcriptOverride: z.string().optional(),
        })
            .parse(req.body);
        // Fetch interview + current question
        const [{ data: interview }, { data: question }] = await Promise.all([
            supabase.from('interviews').select('*').eq('id', interviewId).single(),
            supabase.from('questions').select('*').eq('id', questionId).single(),
        ]);
        if (!interview)
            throw createError('Interview not found', 404);
        if (!question)
            throw createError('Question not found', 404);
        if (interview.status === 'completed')
            throw createError('Interview already completed', 400);
        // 1. Transcribe audio (or use override for testing)
        let transcript = transcriptOverride ?? '';
        let confidence = 1.0;
        let sentiment = null;
        if (!transcript && req.file) {
            const sttResult = await transcribeAudio(req.file.buffer, req.file.mimetype);
            transcript = sttResult.transcript;
            confidence = sttResult.confidence;
            sentiment = sttResult.sentiment;
            // Save audio recording
            const audioPath = `${interview.candidate_id}/${interviewId}/${questionId}.wav`;
            supabase.storage
                .from('audio')
                .upload(audioPath, req.file.buffer, { contentType: req.file.mimetype })
                .then(({ error }) => {
                if (!error) {
                    supabase.from('audio_recordings').insert({
                        interview_id: interviewId,
                        question_id: questionId,
                        file_url: audioPath,
                        transcript,
                        confidence,
                        sentiment,
                    });
                }
            })
                .catch(err => console.warn('[Answer] Audio storage error (non-fatal):', err));
        }
        if (!transcript.trim())
            throw createError('No transcript could be produced', 422);
        // 2. Fetch job title
        const jobTitle = interview.job_description.split('\n')[0].slice(0, 80);
        // 3. RAG retrieval for this question's topic
        const context = await buildQuestionContext(interviewId, question.topic ?? question.question_text);
        const ragContext = formatContextForLLM(context);
        // 4. Evaluate answer via LLM
        const { system: eSys, user: eUser } = buildEvaluateAnswerPrompt({
            question: question.question_text,
            answer: transcript,
            ragContext,
            jobTitle,
            questionType: question.topic ?? 'general',
        });
        const evaluation = await llmCallJSON(eUser, eSys, {
            temperature: 0.3,
            maxTokens: 1000,
        });
        // 5. Save evaluation
        const evaluationId = uuid();
        await supabase.from('evaluations').insert({
            id: evaluationId,
            question_id: questionId,
            interview_id: interviewId,
            answer_text: transcript,
            score: evaluation.score,
            feedback: evaluation.feedback,
            criteria_scores: evaluation.criteriaScores,
            competency_assessment: evaluation.competencyAssessment,
        });
        // 6. Store turn in pgvector (for future RAG context)
        embedAndStoreInterviewTurn({
            interviewId,
            questionText: question.question_text,
            answerText: transcript,
            score: evaluation.score,
        }).catch(err => console.warn('[Answer] Turn embedding error (non-fatal):', err));
        // 7. Check if interview is complete
        const { count } = await supabase
            .from('evaluations')
            .select('id', { count: 'exact', head: true })
            .eq('interview_id', interviewId);
        const answeredCount = count ?? 0;
        const isComplete = answeredCount >= TOTAL_QUESTIONS;
        let nextQuestion = null;
        let nextQuestionId = null;
        let audioBase64 = null;
        if (!isComplete) {
            // 8. Generate next question
            const nextContext = await buildQuestionContext(interviewId, evaluation.nextQuestionTopic);
            const nextRagContext = formatContextForLLM(nextContext);
            const { system: qSys, user: qUser } = buildNextQuestionPrompt({
                ragContext: nextRagContext,
                questionNumber: answeredCount + 1,
                totalQuestions: TOTAL_QUESTIONS,
                previousTopic: question.topic,
                jobTitle,
            });
            const nextQuestionData = await llmCallJSON(qUser, qSys, { temperature: 0.7 });
            nextQuestionId = uuid();
            nextQuestion = nextQuestionData.question;
            await supabase.from('questions').insert({
                id: nextQuestionId,
                interview_id: interviewId,
                question_text: nextQuestion,
                order_index: answeredCount + 1,
                topic: nextQuestionData.topic,
            });
            // 9. Synthesize feedback + next question as audio
            const feedbackScript = `${evaluation.feedback} Now, ${nextQuestion}`;
            audioBase64 = await synthesizeSpeech(feedbackScript);
        }
        else {
            // Synthesize closing acknowledgement
            audioBase64 = await synthesizeSpeech(`Thank you for that answer. You've completed all ${TOTAL_QUESTIONS} questions. Your results are being prepared now.`);
        }
        const response = {
            transcript,
            score: evaluation.score,
            feedback: evaluation.feedback,
            nextQuestion,
            nextQuestionId,
            audioBase64,
            isComplete,
            criteriaScores: evaluation.criteriaScores,
        };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
});
// ── GET /interview/:id ────────────────────────────────────────────────────────
interviewRouter.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const { data, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', id)
            .eq('candidate_id', req.user.id)
            .single();
        if (error || !data)
            throw createError('Interview not found', 404);
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
// ── GET /interview (list all for user) ───────────────────────────────────────
interviewRouter.get('/', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('interviews')
            .select('id, status, overall_score, created_at, job_description, resume_highlights')
            .eq('candidate_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error)
            throw createError(`Failed to fetch interviews: ${error.message}`, 500);
        res.json(data ?? []);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=interview.js.map