import { EdgeTTS } from '@andresaya/edge-tts';
// ── Voice map: frontend voiceId → Edge TTS voice name ─────────────────────────
const EDGE_VOICE_MAP = {
    'edge-neerja': 'en-IN-NeerjaNeural', // Female, Indian
    'edge-prabhat': 'en-IN-PrabhatNeural', // Male, Indian
    'edge-jenny': 'en-US-JennyNeural', // Female, International
};
const DEFAULT_VOICE = 'en-IN-NeerjaNeural';
export async function synthesizeSpeech(text, voiceId) {
    const tts = new EdgeTTS();
    // Resolve voice: check the map first, then use as-is if it looks like an Edge voice, else default
    let voiceName = DEFAULT_VOICE;
    if (voiceId && EDGE_VOICE_MAP[voiceId]) {
        voiceName = EDGE_VOICE_MAP[voiceId];
    }
    else if (voiceId && voiceId.includes('Neural')) {
        voiceName = voiceId;
    }
    await tts.synthesize(text, voiceName, {
        rate: '0%',
        volume: '0%',
        pitch: '+0Hz',
    });
    return tts.toBase64();
}
//# sourceMappingURL=tts.service.js.map