export function buildEvaluateAnswerPrompt(params: {
    question: string
    answer: string
    ragContext: string
    jobTitle: string
    questionType: string
  }): { system: string; user: string } {
    return {
      system: `You are an expert interview evaluator. Score candidates fairly and specifically.
  Base evaluations strictly on the provided answer — do not assume or infer unsaid content.
  Always provide actionable, specific feedback grounded in what the candidate actually said.
  CRITICAL INSTRUCTION: If the candidate's answer is extremely short, generic (like "thank you", "I don't know"), or less than 15 words, you MUST give it a very low score (0-20) and your feedback must state that the answer was too short or insufficient. DO NOT hallucinate that they provided details from their background context.
  Respond with JSON only.`,
  
      user: `Evaluate this interview answer for a ${params.jobTitle} position.
  
  Question (${params.questionType}): ${params.question}
  
  Candidate Answer: ${params.answer}
  
  Candidate's Resume/Background Context (For reference only - DO NOT assume the candidate mentioned any of this unless explicitly stated in their Candidate Answer):
  ${params.ragContext}
  
  Score the answer and respond with:
  {
    "score": <0-100 integer>,
    "feedback": "2-3 sentences of specific, constructive feedback referencing what was ACTUALLY said in the Candidate Answer. Do NOT hallucinate.",
    "criteriaScores": {
      "clarity": <0-100>,
      "relevance": <0-100>,
      "depth": <0-100>,
      "specificity": <0-100>,
      "impact": <0-100>
    },
    "competencyAssessment": {
      "communication": "strong" | "adequate" | "needs improvement",
      "technicalDepth": "strong" | "adequate" | "needs improvement",
      "problemSolving": "strong" | "adequate" | "needs improvement"
    },
    "nextQuestionTopic": "suggested topic for the next question based on gaps or strengths revealed"
  }
  
  Scoring guide:
  - 90-100: Exceptional — specific examples, quantified impact, directly relevant
  - 75-89: Strong — clear answer with good detail
  - 60-74: Competent — adequate but lacking depth or specifics
  - 45-59: Developing — partially answers but misses key elements
  - 0-44: Insufficient — vague, extremely short ("thank you"), off-topic, or very thin`,
    }
  }