export function buildFinalReportPrompt(params) {
    return {
        system: `You are a senior hiring manager writing a structured interview debrief report.
  Be specific, fair, evidence-based, and actionable.
  Write in professional prose — no bullet points, no headers.
  Keep the report under 250 words.`,
        user: `Write a final interview report for:
  - Candidate: ${params.candidateName}
  - Role: ${params.jobTitle}
  - Overall Score: ${params.overallScore}/100
  
  Resume Background:
  ${params.resumeHighlights}
  
  Interview Performance Summary:
  ${params.evaluationSummary}
  
  The report must cover:
  1. Overall impression and fit for the role
  2. Two strongest demonstrated competencies with specific evidence
  3. Two key areas for development
  4. Hiring recommendation (advance / consider / pass)`,
    };
}
export function buildFinalThanksPrompt(candidateName) {
    return {
        system: `You are a professional AI interviewer. Keep closing messages warm and brief (2 sentences max).`,
        user: `Generate a brief, warm closing message for ${candidateName} thanking them for their time and letting them know the results will be ready shortly.`,
    };
}
//# sourceMappingURL=finalReport.js.map