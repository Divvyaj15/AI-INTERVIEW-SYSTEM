import { create } from 'zustand'
import type { AppState, InterviewPhase, ConversationTurn } from '../types/index.ts'

const initialState = {
  phase: 'home' as InterviewPhase,
  interviewId: null,
  candidateName: '',
  resumeHighlights: '',
  jobDescription: '',
  voiceId: 'edge-neerja',
  currentQuestion: '',
  currentQuestionId: null,
  questionNumber: 1,
  totalQuestions: 5,
  conversation: [],
  overallScore: null,
  grade: '',
  marketPosition: '',
  finalReport: '',
  isRecording: false,
  isProcessing: false,
  isPlayingAudio: false,
  error: null,
}

export const useInterviewStore = create<AppState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setInterviewId: (interviewId) => set({ interviewId }),

  setCandidateInfo: (candidateName, resumeHighlights) =>
    set({ candidateName, resumeHighlights }),

  setCurrentQuestion: (currentQuestion, currentQuestionId) =>
    set({ currentQuestion, currentQuestionId }),

  addConversationTurn: (turn: ConversationTurn) =>
    set((state) => ({ conversation: [...state.conversation, turn] })),

  setResults: (overallScore, grade, marketPosition, finalReport) =>
    set({ overallScore, grade, marketPosition, finalReport }),

  setRecording: (isRecording) => set({ isRecording }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),

  setError: (error) => set({ error }),

  setJobDescription: (jobDescription) => set({ jobDescription }),

  setVoiceId: (voiceId) => set({ voiceId }),

  incrementQuestion: () =>
    set((state) => ({ questionNumber: state.questionNumber + 1 })),

  setTotalQuestions: (totalQuestions) => set({ totalQuestions }),

  reset: () => set(initialState),
}))