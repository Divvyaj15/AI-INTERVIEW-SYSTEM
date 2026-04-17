import { createClient } from '@deepgram/sdk';
if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error('Missing DEEPGRAM_API_KEY env var');
}
export const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
//# sourceMappingURL=deepgram.js.map