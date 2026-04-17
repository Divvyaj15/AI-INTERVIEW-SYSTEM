import type { ResumeChunk, JDChunk, QuestionBankEntry, Rubric, InterviewTurn } from '../types/index.js';
export declare function retrieveResumeChunks(query: string, interviewId: string, topK?: number): Promise<ResumeChunk[]>;
export declare function retrieveJDChunks(query: string, interviewId: string, topK?: number): Promise<JDChunk[]>;
export declare function retrieveQuestionBankEntries(query: string, topK?: number): Promise<QuestionBankEntry[]>;
export declare function retrieveRubric(competency: string): Promise<Rubric | null>;
export declare function retrievePriorTurns(query: string, interviewId: string, topK?: number): Promise<InterviewTurn[]>;
//# sourceMappingURL=retriever.d.ts.map