import { supabase } from '../lib/supabase.js'
import { generateEmbedding } from '../services/embedding.service.js'
import type { ResumeChunk, JDChunk, QuestionBankEntry, Rubric, InterviewTurn } from '../types/index.js'

const DEFAULT_TOP_K = 4
const VECTOR_DIMENSION_MISMATCH = 'different vector dimensions'

export async function retrieveResumeChunks(
  query: string,
  interviewId: string,
  topK = DEFAULT_TOP_K
): Promise<ResumeChunk[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_resume_chunks', {
    query_embedding: embedding,
    match_interview_id: interviewId,
    match_count: topK,
  })

  if (error) {
    if (isVectorDimensionMismatch(error.message)) return []
    throw new Error(`Resume chunk retrieval failed: ${error.message}`)
  }
  return (data ?? []) as ResumeChunk[]
}

export async function retrieveJDChunks(
  query: string,
  interviewId: string,
  topK = DEFAULT_TOP_K
): Promise<JDChunk[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_jd_chunks', {
    query_embedding: embedding,
    match_interview_id: interviewId,
    match_count: topK,
  })

  if (error) {
    if (isVectorDimensionMismatch(error.message)) return []
    throw new Error(`JD chunk retrieval failed: ${error.message}`)
  }
  return (data ?? []) as JDChunk[]
}

export async function retrieveQuestionBankEntries(
  query: string,
  topK = 5
): Promise<QuestionBankEntry[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_question_bank', {
    query_embedding: embedding,
    match_count: topK,
  })

  if (error) {
    if (isVectorDimensionMismatch(error.message)) return []
    throw new Error(`Question bank retrieval failed: ${error.message}`)
  }
  return (data ?? []) as QuestionBankEntry[]
}

export async function retrieveRubric(competency: string): Promise<Rubric | null> {
  const embedding = await generateEmbedding(competency)

  const { data, error } = await supabase.rpc('match_rubric', {
    query_embedding: embedding,
    match_count: 1,
  })

  if (error) {
    if (isVectorDimensionMismatch(error.message)) return null
    throw new Error(`Rubric retrieval failed: ${error.message}`)
  }
  return (data?.[0] ?? null) as Rubric | null
}

export async function retrievePriorTurns(
  query: string,
  interviewId: string,
  topK = 3
): Promise<InterviewTurn[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_interview_turns', {
    query_embedding: embedding,
    match_interview_id: interviewId,
    match_count: topK,
  })

  if (error) {
    if (isVectorDimensionMismatch(error.message)) return []
    throw new Error(`Prior turns retrieval failed: ${error.message}`)
  }
  return (data ?? []) as InterviewTurn[]
}

function isVectorDimensionMismatch(message: string): boolean {
  return message.toLowerCase().includes(VECTOR_DIMENSION_MISMATCH)
}