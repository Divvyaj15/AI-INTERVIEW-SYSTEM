import { Router } from 'express';
import { z } from 'zod';
import { supabaseAnon } from '../lib/supabase.js';
import { createError } from '../middleware/errorHandler.js';
export const authRouter = Router();
const AuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
// POST /auth/signup
authRouter.post('/signup', async (req, res, next) => {
    try {
        const { email, password } = AuthSchema.parse(req.body);
        const { data, error } = await supabaseAnon.auth.signUp({ email, password });
        if (error)
            throw createError(error.message, 400);
        if (!data.user)
            throw createError('Signup failed', 500);
        res.status(201).json({
            message: 'Account created. Check your email to confirm.',
            userId: data.user.id,
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /auth/login
authRouter.post('/login', async (req, res, next) => {
    try {
        const { email, password } = AuthSchema.parse(req.body);
        const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
        if (error)
            throw createError(error.message, 401);
        if (!data.session)
            throw createError('Login failed', 500);
        res.json({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
                id: data.user.id,
                email: data.user.email,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /auth/logout
authRouter.post('/logout', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token)
            await supabaseAnon.auth.signOut();
        res.json({ message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
});
// POST /auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
        const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token: refreshToken });
        if (error)
            throw createError(error.message, 401);
        if (!data.session)
            throw createError('Refresh failed', 500);
        res.json({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
        });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=auth.js.map