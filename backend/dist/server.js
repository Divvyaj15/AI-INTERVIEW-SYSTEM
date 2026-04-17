import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { intakeRouter } from './routes/intake.js';
import { interviewRouter } from './routes/interview.js';
import { evaluationRouter } from './routes/evaluation.js';
import { voiceRouter } from './routes/voice.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
const app = express();
const PORT = process.env.PORT ?? 4000;
// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
}));
// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth requests' }));
app.use('/interview', rateLimit({ windowMs: 60 * 1000, max: 60 }));
app.use('/voice', rateLimit({ windowMs: 60 * 1000, max: 30 }));
// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});
// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/intake', intakeRouter);
app.use('/interview', interviewRouter);
app.use('/evaluation', evaluationRouter);
app.use('/voice', voiceRouter);
// ── 404 + Error handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);
// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║   Interviewer API — ready            ║
║   http://localhost:${PORT}             ║
║   ENV: ${process.env.NODE_ENV ?? 'development'}                  ║
╚══════════════════════════════════════╝
  `);
});
export default app;
//# sourceMappingURL=server.js.map