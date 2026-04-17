import { generateBatchEmbeddings } from '../services/embedding.service.js';
import { supabase } from '../lib/supabase.js';
export async function embedAndStoreResumeChunks(chunks) {
    if (chunks.length === 0)
        return;
    const texts = chunks.map(c => c.content);
    const embeddings = await generateBatchEmbeddings(texts);
    const rows = chunks.map((chunk, i) => ({
        id: chunk.id,
        interview_id: chunk.interview_id,
        candidate_id: chunk.candidate_id,
        content: chunk.content,
        section_type: chunk.section_type,
        metadata: chunk.metadata,
        embedding: embeddings[i],
    }));
    const { error } = await supabase.from('resume_chunks').upsert(rows);
    if (error)
        throw new Error(`Failed to store resume chunks: ${error.message}`);
}
export async function embedAndStoreJDChunks(chunks) {
    if (chunks.length === 0)
        return;
    const texts = chunks.map(c => c.content);
    const embeddings = await generateBatchEmbeddings(texts);
    const rows = chunks.map((chunk, i) => ({
        id: chunk.id,
        interview_id: chunk.interview_id,
        content: chunk.content,
        requirement_type: chunk.requirement_type,
        metadata: chunk.metadata,
        embedding: embeddings[i],
    }));
    const { error } = await supabase.from('jd_chunks').upsert(rows);
    if (error)
        throw new Error(`Failed to store JD chunks: ${error.message}`);
}
export async function embedAndStoreInterviewTurn(params) {
    const combined = `Q: ${params.questionText}\nA: ${params.answerText}`;
    const [embedding] = await generateBatchEmbeddings([combined]);
    const { error } = await supabase.from('interview_turns').insert({
        interview_id: params.interviewId,
        question_text: params.questionText,
        answer_text: params.answerText,
        score: params.score,
        embedding,
    });
    if (error)
        throw new Error(`Failed to store interview turn: ${error.message}`);
}
//# sourceMappingURL=embedder.js.map