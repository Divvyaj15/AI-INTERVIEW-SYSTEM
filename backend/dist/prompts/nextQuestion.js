export function buildNextQuestionPrompt(params) {
    return {
        system: `You are an expert technical and behavioral interviewer.
  Generate insightful, specific interview questions based on the candidate's actual background.
  Questions must be directly grounded in the provided resume and job description context.
  Never ask generic questions that could apply to any candidate.
  Respond with JSON only.`,
        user: `Generate question ${params.questionNumber} of ${params.totalQuestions} for a ${params.jobTitle} interview.
  
  ${params.ragContext}
  
  ${params.previousTopic ? `Previous question was about: ${params.previousTopic}. Choose a DIFFERENT topic.` : ''}
  
  Rules:
  - Reference specific details from the resume (projects, companies, technologies)
  - Connect the question to specific job requirements
  - Mix behavioral (STAR format) and technical questions
  - Vary difficulty as the interview progresses
  - Keep questions focused and clear (1-2 sentences max)
  
  Respond with:
  {
    "question": "the exact question to ask",
    "topic": "brief topic label (e.g. 'React experience', 'leadership', 'system design')",
    "type": "behavioral" | "technical" | "situational",
    "rationale": "why this question is relevant (internal, not shown to candidate)"
  }`,
    };
}
//# sourceMappingURL=nextQuestion.js.map