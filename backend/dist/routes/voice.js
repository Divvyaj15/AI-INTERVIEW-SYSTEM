import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { synthesizeSpeech } from '../services/tts.service.js';
import { transcribeAudio } from '../services/stt.service.js';
export const voiceRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
// POST /voice/tts — text → base64 MP3
voiceRouter.post('/tts', authMiddleware, async (req, res, next) => {
    try {
        const { text, voiceId } = z
            .object({
            text: z.string().min(1).max(5000),
            voiceId: z.string().optional(),
        })
            .parse(req.body);
        const audioBase64 = await synthesizeSpeech(text, voiceId);
        res.json({ audioBase64, mimeType: 'audio/mpeg' });
    }
    catch (err) {
        next(err);
    }
});
// POST /voice/stt — audio buffer → transcript
voiceRouter.post('/stt', authMiddleware, upload.single('audio'), async (req, res, next) => {
    try {
        if (!req.file)
            throw createError('Audio file is required', 400);
        const result = await transcribeAudio(req.file.buffer, req.file.mimetype);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=voice.js.map