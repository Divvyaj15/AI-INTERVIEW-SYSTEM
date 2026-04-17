import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { llmCallJSON } from '../services/llm.service.js';
import { buildExtractResumePrompt } from '../prompts/extractResume.js';
import { chunkResume, chunkJD } from '../rag/chunker.js';
import { embedAndStoreResumeChunks, embedAndStoreJDChunks } from '../rag/embedder.js';
import { supabase } from '../lib/supabase.js';
import { v4 as uuid } from 'uuid';
export const intakeRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf')
            cb(null, true);
        else
            cb(new Error('Only PDF files are accepted'));
    },
});
// POST /intake
intakeRouter.post('/', authMiddleware, upload.single('resume'), async (req, res, next) => {
    try {
        // Validate request
        if (!req.file)
            throw createError('Resume PDF is required', 400);
        const { jobDescription } = z
            .object({ jobDescription: z.string().min(50, 'Job description too short') })
            .parse(req.body);
        const userId = req.user.id;
        const interviewId = uuid();
        // 1. Parse PDF
        const { text: resumeText } = await extractTextFromPDF(req.file.buffer);
        // 2. Upload PDF to Supabase Storage
        const filePath = `${userId}/${interviewId}/resume.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, req.file.buffer, { contentType: 'application/pdf' });
        if (uploadError) {
            console.warn('[Intake] Storage upload failed (non-fatal):', uploadError.message);
        }
        // 3. Extract candidate info via LLM
        const { system, user } = buildExtractResumePrompt(resumeText);
        const extraction = await llmCallJSON(user, system, {
            temperature: 0.2,
            maxTokens: 800,
        });
        // 4. Create interview record
        const { error: dbError } = await supabase.from('interviews').insert({
            id: interviewId,
            candidate_id: userId,
            job_description: jobDescription,
            resume_url: filePath,
            resume_highlights: extraction.highlights,
            status: 'pending',
        });
        if (dbError)
            throw createError(`DB insert failed: ${dbError.message}`, 500);
        // 5. Chunk + embed both documents (non-blocking for faster response)
        const resumeChunks = chunkResume(resumeText, userId, interviewId);
        const jdChunks = chunkJD(jobDescription, interviewId);
        Promise.all([
            embedAndStoreResumeChunks(resumeChunks),
            embedAndStoreJDChunks(jdChunks),
        ]).catch(err => console.error('[Intake] Embedding pipeline error:', err));
        const response = {
            interviewId,
            candidateName: extraction.name,
            resumeHighlights: extraction.highlights,
            message: 'Interview created. Embeddings are being processed in the background.',
        };
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=intake.js.map