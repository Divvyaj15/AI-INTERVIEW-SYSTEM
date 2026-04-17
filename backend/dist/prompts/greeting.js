export function buildGreetingPrompt(params) {
    return {
        system: `You are a professional, warm, and encouraging AI interviewer.
  Keep greetings concise (2-3 sentences max), friendly, and professional.
  Do not use filler phrases like "Great!" or "Absolutely!".`,
        user: `Generate a brief interview greeting for:
  - Candidate: ${params.candidateName}
  - Role: ${params.jobTitle}
  - Context: ${params.companyContext}
  
  The greeting should:
  1. Welcome the candidate by first name
  2. Briefly state the purpose (practice interview for the role)
  3. Let them know you'll ask several questions and they should answer naturally
  4. End by asking them to introduce themselves briefly`,
    };
}
//# sourceMappingURL=greeting.js.map