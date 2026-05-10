import axios from 'axios'
import type {
  IntakeResponse,
  StartResponse,
  AnswerResponse,
  CompleteResponse,
  ResultsResponse,
  AuthResponse,
} from '../types/index.ts'

import { useAuthStore } from '../store/authStore.ts'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// ── Auth Interceptor ──────────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function signup(email: string, password: string): Promise<{ message: string; userId: string }> {
  const { data } = await api.post<{ message: string; userId: string }>('/auth/signup', { email, password })
  return data
}

// ── Intake ────────────────────────────────────────────────────────────────────

export async function uploadIntake(
  resumeFile: File,
  jobDescription: string,
  maxQuestions: number = 5
): Promise<IntakeResponse> {
  const formData = new FormData()
  formData.append('resume', resumeFile)
  formData.append('jobDescription', jobDescription)
  formData.append('maxQuestions', maxQuestions.toString())

  const { data } = await api.post<IntakeResponse>('/intake', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ── Interview ─────────────────────────────────────────────────────────────────

export async function startInterview(interviewId: string, voiceId?: string): Promise<StartResponse> {
  const params = voiceId ? { voiceId } : {}
  const { data } = await api.get<StartResponse>(`/interview/${interviewId}/start`, { params })
  return data
}

export async function submitAnswer(
  interviewId: string,
  questionId: string,
  audioBlob: Blob | null,
  transcriptOverride?: string,
  voiceId?: string
): Promise<AnswerResponse> {
  const formData = new FormData()
  formData.append('questionId', questionId)

  if (transcriptOverride) {
    formData.append('transcriptOverride', transcriptOverride)
  } else if (audioBlob) {
    formData.append('audio', audioBlob, 'answer.wav')
  }

  if (voiceId) {
    formData.append('voiceId', voiceId)
  }

  const { data } = await api.post<AnswerResponse>(
    `/interview/${interviewId}/answer`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function getInterview(interviewId: string) {
  const { data } = await api.get(`/interview/${interviewId}`)
  return data
}

// ── Evaluation ────────────────────────────────────────────────────────────────

export async function completeInterview(interviewId: string, voiceId?: string): Promise<CompleteResponse> {
  const { data } = await api.post<CompleteResponse>(`/evaluation/${interviewId}/complete`, { voiceId })
  return data
}

export async function getResults(interviewId: string): Promise<ResultsResponse> {
  const { data } = await api.get<ResultsResponse>(`/evaluation/${interviewId}/results`)
  return data
}

// ── Voice ─────────────────────────────────────────────────────────────────────

export async function textToSpeech(text: string, voiceType?: string): Promise<string> {
  const { data } = await api.post<{ audioBase64: string }>('/voice/tts', {
    text,
    voiceType,
  })
  return data.audioBase64
}