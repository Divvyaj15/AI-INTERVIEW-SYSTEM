import { retrieveResumeChunks, retrieveJDChunks, retrieveQuestionBankEntries, retrieveRubric, retrievePriorTurns, } from './retriever.js';
export async function buildQuestionContext(interviewId, topic) {
    // Run all retrievals in parallel for speed
    const [resumeChunks, jdChunks, priorTurns, relevantQuestions, rubric] = await Promise.all([
        retrieveResumeChunks(topic, interviewId),
        retrieveJDChunks(topic, interviewId),
        retrievePriorTurns(topic, interviewId),
        retrieveQuestionBankEntries(topic),
        retrieveRubric(topic),
    ]);
    return { resumeChunks, jdChunks, priorTurns, relevantQuestions, rubric };
}
export function formatContextForLLM(context) {
    const sections = [];
    if (context.resumeChunks.length > 0) {
        sections.push('## Relevant Resume Sections\n' +
            context.resumeChunks.map(c => `[${c.section_type}] ${c.content}`).join('\n\n'));
    }
    if (context.jdChunks.length > 0) {
        sections.push('## Relevant Job Requirements\n' +
            context.jdChunks.map(c => `[${c.requirement_type}] ${c.content}`).join('\n\n'));
    }
    if (context.priorTurns.length > 0) {
        sections.push('## Prior Interview Turns\n' +
            context.priorTurns.map(t => `Q: ${t.question_text}\nA: ${t.answer_text}\nScore: ${t.score}/100`).join('\n\n'));
    }
    if (context.rubric) {
        sections.push('## Scoring Rubric\n' +
            `Competency: ${context.rubric.competency}\n` +
            `Criteria: ${context.rubric.criteria}\n` +
            `Guide: ${context.rubric.scoring_guide}`);
    }
    return sections.join('\n\n---\n\n');
}
//# sourceMappingURL=contextBuilder.js.map