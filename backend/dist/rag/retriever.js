import { supabase } from '../lib/supabase.js';
import { generateEmbedding } from '../services/embedding.service.js';
const DEFAULT_TOP_K = 4;
const VECTOR_DIMENSION_MISMATCH = 'different vector dimensions';
export async function retrieveResumeChunks(query, interviewId, topK = DEFAULT_TOP_K) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_resume_chunks', {
        query_embedding: embedding,
        match_interview_id: interviewId,
        match_count: topK,
    });
    if (error) {
        if (isVectorDimensionMismatch(error.message))
            return [];
        throw new Error(`Resume chunk retrieval failed: ${error.message}`);
    }
    return (data ?? []);
}
export async function retrieveJDChunks(query, interviewId, topK = DEFAULT_TOP_K) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_jd_chunks', {
        query_embedding: embedding,
        match_interview_id: interviewId,
        match_count: topK,
    });
    if (error) {
        if (isVectorDimensionMismatch(error.message))
            return [];
        throw new Error(`JD chunk retrieval failed: ${error.message}`);
    }
    return (data ?? []);
}
export async function retrieveQuestionBankEntries(query, topK = 5) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_question_bank', {
        query_embedding: embedding,
        match_count: topK,
    });
    if (error) {
        if (isVectorDimensionMismatch(error.message))
            return [];
        throw new Error(`Question bank retrieval failed: ${error.message}`);
    }
    return (data ?? []);
}
export async function retrieveRubric(competency) {
    const embedding = await generateEmbedding(competency);
    const { data, error } = await supabase.rpc('match_rubric', {
        query_embedding: embedding,
        match_count: 1,
    });
    if (error) {
        if (isVectorDimensionMismatch(error.message))
            return null;
        throw new Error(`Rubric retrieval failed: ${error.message}`);
    }
    return (data?.[0] ?? null);
}
export async function retrievePriorTurns(query, interviewId, topK = 3) {
    const embedding = await generateEmbedding(query);
    const { data, error } = await supabase.rpc('match_interview_turns', {
        query_embedding: embedding,
        match_interview_id: interviewId,
        match_count: topK,
    });
    if (error) {
        if (isVectorDimensionMismatch(error.message))
            return [];
        throw new Error(`Prior turns retrieval failed: ${error.message}`);
    }
    return (data ?? []);
}
function isVectorDimensionMismatch(message) {
    return message.toLowerCase().includes(VECTOR_DIMENSION_MISMATCH);
}
//# sourceMappingURL=retriever.js.map