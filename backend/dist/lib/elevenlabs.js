import { ElevenLabsClient } from 'elevenlabs';
if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('Missing ELEVENLABS_API_KEY env var');
}
export const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
export const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRTpX';
//# sourceMappingURL=elevenlabs.js.map