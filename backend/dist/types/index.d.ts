export interface Candidate {
    id: string;
    email: string;
    name: string;
    created_at: string;
}
export interface Interview {
    id: string;
    candidate_id: string;
    job_description: string;
    resume_url: string | null;
    resume_highlights: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    overall_score: number | null;
    created_at: string;
    updated_at: string;
}
export interface Question {
    id: string;
    interview_id: string;
    question_text: string;
    order_index: number;
    topic: string | null;
    created_at: string;
}
export interface Evaluation {
    id: string;
    question_id: string;
    interview_id: string;
    answer_text: string;
    score: number;
    feedback: string;
    criteria_scores: Record<string, number> | null;
    competency_assessment: Record<string, string> | null;
    created_at: string;
}
export interface AudioRecording {
    id: string;
    interview_id: string;
    question_id: string;
    file_url: string;
    transcript: string | null;
    confidence: number | null;
    sentiment: string | null;
    created_at: string;
}
export interface RAGChunk {
    id: string;
    content: string;
    embedding?: number[];
    metadata: Record<string, string>;
    similarity?: number;
}
export interface ResumeChunk extends RAGChunk {
    candidate_id: string;
    interview_id: string;
    section_type: 'experience' | 'skills' | 'education' | 'projects' | 'summary' | 'other';
}
export interface JDChunk extends RAGChunk {
    interview_id: string;
    requirement_type: 'required' | 'preferred' | 'responsibility' | 'other';
}
export interface QuestionBankEntry {
    id: string;
    question_text: string;
    domain: string;
    difficulty: 'easy' | 'medium' | 'hard';
    competency: string;
    embedding?: number[];
}
export interface Rubric {
    id: string;
    competency: string;
    criteria: string;
    scoring_guide: string;
    embedding?: number[];
}
export interface InterviewTurn {
    id: string;
    interview_id: string;
    question_text: string;
    answer_text: string;
    score: number;
    embedding?: number[];
    created_at: string;
}
export interface IntakeRequest {
    jobDescription: string;
}
export interface IntakeResponse {
    interviewId: string;
    candidateName: string;
    resumeHighlights: string;
    message: string;
}
export interface AnswerRequest {
    interviewId: string;
    questionId: string;
    audioBase64?: string;
    transcriptOverride?: string;
}
export interface AnswerResponse {
    transcript: string;
    score: number;
    feedback: string;
    nextQuestion: string | null;
    nextQuestionId: string | null;
    audioBase64: string | null;
    isComplete: boolean;
    criteriaScores: Record<string, number> | null;
}
export interface StartResponse {
    greeting: string;
    audioBase64: string;
    firstQuestion: string;
    questionId: string;
}
export interface ResultsResponse {
    interview: Interview;
    evaluations: Array<{
        question: Question;
        evaluation: Evaluation;
    }>;
    overallScore: number;
    finalReport: string;
}
export interface RAGContext {
    resumeChunks: ResumeChunk[];
    jdChunks: JDChunk[];
    priorTurns: InterviewTurn[];
    relevantQuestions: QuestionBankEntry[];
    rubric: Rubric | null;
}
export interface ResumeExtraction {
    name: string;
    email: string | null;
    currentRole: string;
    yearsOfExperience: number;
    topSkills: string[];
    highlights: string;
}
export interface LLMEvaluationResult {
    score: number;
    feedback: string;
    criteriaScores: Record<string, number>;
    competencyAssessment: Record<string, string>;
    nextQuestionTopic: string;
}
export interface AuthUser {
    id: string;
    email: string;
}
//# sourceMappingURL=index.d.ts.map