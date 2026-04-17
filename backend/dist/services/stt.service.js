import { deepgram } from '../lib/deepgram.js';
export async function transcribeAudio(buffer, mimeType = 'audio/wav') {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(buffer, {
        mimetype: mimeType,
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        diarize: false,
        sentiment: true,
        language: 'en',
    });
    if (error) {
        throw new Error(`Deepgram transcription failed: ${error.message}`);
    }
    const channel = result?.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];
    if (!alternative) {
        throw new Error('No transcription result returned from Deepgram');
    }
    const sentimentRaw = result?.results?.sentiments?.segments?.[0]?.sentiment;
    const sentiment = sentimentRaw === 'positive' || sentimentRaw === 'negative' || sentimentRaw === 'neutral'
        ? sentimentRaw
        : null;
    return {
        transcript: alternative.transcript ?? '',
        confidence: alternative.confidence ?? 0,
        words: (alternative.words ?? []).map(w => ({
            word: w.word ?? '',
            start: w.start ?? 0,
            end: w.end ?? 0,
            confidence: w.confidence ?? 0,
        })),
        sentiment,
    };
}
//# sourceMappingURL=stt.service.js.map