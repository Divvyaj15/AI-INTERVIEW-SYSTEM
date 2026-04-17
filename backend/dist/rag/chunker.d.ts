import type { ResumeChunk, JDChunk } from '../types/index.js';
export declare function chunkResume(text: string, candidateId: string, interviewId: string): Omit<ResumeChunk, 'embedding'>[];
export declare function chunkJD(text: string, interviewId: string): Omit<JDChunk, 'embedding'>[];
//# sourceMappingURL=chunker.d.ts.map