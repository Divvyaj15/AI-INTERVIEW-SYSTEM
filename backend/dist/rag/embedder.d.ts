import type { ResumeChunk, JDChunk } from '../types/index.js';
export declare function embedAndStoreResumeChunks(chunks: Omit<ResumeChunk, 'embedding'>[]): Promise<void>;
export declare function embedAndStoreJDChunks(chunks: Omit<JDChunk, 'embedding'>[]): Promise<void>;
export declare function embedAndStoreInterviewTurn(params: {
    interviewId: string;
    questionText: string;
    answerText: string;
    score: number;
}): Promise<void>;
//# sourceMappingURL=embedder.d.ts.map