// ── Interview types ───────────────────────────────────────────────────────────

export interface Interview {
  id: string
  candidate_id: string
  job_description: string
  resume_url: string | null
  resume_highlights: string | null
  status: 'pending' | 'in_progress' | 'completed'
  overall_score: number | null
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  interview_id: string
  question_text: string
  order_index: number
  topic: string | null
  created_at: string
}

export interface Evaluation {
  id: string
  question_id: string
  interview_id: string
  answer_text: string
  score: number
  feedback: string
  criteria_scores: Record<string, number> | null
  competency_assessment: Record<string, string> | null
  created_at: string
}

// ── API Response types ────────────────────────────────────────────────────────

export interface IntakeResponse {
  interviewId: string
  candidateName: string
  resumeHighlights: string
  message: string
}

export interface StartResponse {
  greeting: string
  audioBase64: string
  firstQuestion: string
  questionId: string
}

export interface AnswerResponse {
  transcript: string
  score: number
  feedback: string
  nextQuestion: string | null
  nextQuestionId: string | null
  audioBase64: string | null
  isComplete: boolean
  criteriaScores: Record<string, number> | null
}

export interface CompleteResponse {
  overallScore: number
  grade: string
  marketPosition: string
  finalReport: string
  closingAudio: string
}

export interface ResultsResponse {
  interview: Interview
  evaluations: Array<{
    question: Question
    evaluation: Evaluation
  }>
  overallScore: number
  finalReport: string
}

// ── App state types ────────────────────────────────────────────────────────────

export type InterviewPhase =
  | 'home'
  | 'uploading'
  | 'ready'
  | 'starting'
  | 'interviewing'
  | 'processing'
  | 'completing'
  | 'results'

export interface ConversationTurn {
  questionId: string
  question: string
  answer: string
  score: number
  feedback: string
  criteriaScores: Record<string, number> | null
  audioBase64: string | null
}

export interface AppState {
  // Phase
  phase: InterviewPhase

  // Interview data
  interviewId: string | null
  candidateName: string
  resumeHighlights: string
  jobDescription: string
  voiceId: string

  // Current question
  currentQuestion: string
  currentQuestionId: string | null
  questionNumber: number
  totalQuestions: number

  // Conversation history
  conversation: ConversationTurn[]

  // Results
  overallScore: number | null
  grade: string
  marketPosition: string
  finalReport: string

  // UI state
  isRecording: boolean
  isProcessing: boolean
  isPlayingAudio: boolean
  error: string | null

  // Actions
  setPhase: (phase: InterviewPhase) => void
  setInterviewId: (id: string) => void
  setCandidateInfo: (name: string, highlights: string) => void
  setCurrentQuestion: (question: string, questionId: string) => void
  addConversationTurn: (turn: ConversationTurn) => void
  setResults: (score: number, grade: string, position: string, report: string) => void
  setRecording: (recording: boolean) => void
  setProcessing: (processing: boolean) => void
  setPlayingAudio: (playing: boolean) => void
  setError: (error: string | null) => void
  setJobDescription: (jd: string) => void
  setVoiceId: (voiceId: string) => void
  incrementQuestion: () => void
  setTotalQuestions: (n: number) => void
  reset: () => void
}

// ── Auth types ────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setAuth: (user: User, token: string) => void
  logout: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}