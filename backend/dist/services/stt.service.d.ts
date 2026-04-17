export interface TranscriptionResult {
    transcript: string;
    confidence: number;
    words: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
    }>;
    sentiment: 'positive' | 'negative' | 'neutral' | null;
}
export declare function transcribeAudio(buffer: Buffer, mimeType?: string): Promise<TranscriptionResult>;
//# sourceMappingURL=stt.service.d.ts.map