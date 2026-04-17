import OpenAI from 'openai';
if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY env var');
}
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
//# sourceMappingURL=openaiEmbeddings.js.map