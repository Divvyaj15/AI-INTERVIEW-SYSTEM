import type { RAGContext } from '../types/index.js';
export declare function buildQuestionContext(interviewId: string, topic: string): Promise<RAGContext>;
export declare function formatContextForLLM(context: RAGContext): string;
//# sourceMappingURL=contextBuilder.d.ts.map