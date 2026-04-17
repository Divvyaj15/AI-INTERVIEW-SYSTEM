import { supabaseAnon } from '../lib/supabase.js';
export async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data, error } = await supabaseAnon.auth.getUser(token);
        if (error || !data.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
            return;
        }
        req.user = {
            id: data.user.id,
            email: data.user.email ?? '',
        };
        next();
    }
    catch {
        res.status(401).json({ error: 'Unauthorized', message: 'Token verification failed' });
    }
}
//# sourceMappingURL=auth.js.map