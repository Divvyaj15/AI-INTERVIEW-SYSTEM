
import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { createError } from '../middleware/errorHandler.js'
import { extractTextFromPDF } from '../services/pdf.service.js'
import { llmCallJSON } from '../services/llm.service.js'
import { buildExtractResumePrompt } from '../prompts/extractResume.js'
import { chunkResume, chunkJD } from '../rag/chunker.js'
import { embedAndStoreResumeChunks, embedAndStoreJDChunks } from '../rag/embedder.js'
import { supabase } from '../lib/supabase.js'
import { v4 as uuid } from 'uuid'
import type { IntakeResponse, ResumeExtraction } from '../types/index.js'

export const intakeRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'))
  },
})

// POST /intake
intakeRouter.post(
  '/',
  authMiddleware,
  upload.single('resume'),
  async (req, res, next) => {
    try {
      if (!req.file) throw createError('Resume PDF is required', 400)

      const { jobDescription, maxQuestions } = z
        .object({ 
          jobDescription: z.string().min(1, 'Job description is required'),
          maxQuestions: z.string().optional().transform(v => parseInt(v || '5'))
        })
        .parse(req.body)

      const userId = req.user!.id
      const interviewId = uuid()

      // 1. Parse PDF
      const { text: resumeText } = await extractTextFromPDF(req.file.buffer)

      // 2. Extract candidate info via LLM
      const { system, user } = buildExtractResumePrompt(resumeText)
      const extraction = await llmCallJSON<ResumeExtraction>(user, system, {
        temperature: 0.2,
        maxTokens: 800,
      })

      // 3. Create interview record
      const { error: dbError } = await supabase.from('interviews').insert({
        id: interviewId,
        candidate_id: userId,
        job_description: jobDescription,
        resume_highlights: extraction.highlights,
        max_questions: maxQuestions,
        status: 'pending',
      })

      if (dbError) throw createError(`DB insert failed: ${dbError.message}`, 500)

      // 4. Chunk + embed both documents
      const resumeChunks = chunkResume(resumeText, userId, interviewId)
      const jdChunks = chunkJD(jobDescription, interviewId)

      Promise.all([
        embedAndStoreResumeChunks(resumeChunks),
        embedAndStoreJDChunks(jdChunks),
      ]).catch(err => console.error('[Intake] Embedding pipeline error:', err))

      const response: IntakeResponse = {
        interviewId,
        candidateName: extraction.name,
        resumeHighlights: extraction.highlights,
        message: 'Interview created.',
      }

      res.status(201).json(response)
    } catch (err) {
      next(err)
    }
  }
)