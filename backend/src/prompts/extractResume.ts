export function buildExtractResumePrompt(resumeText: string): {
    system: string
    user: string
  } {
    return {
      system: `You are a resume parser. Extract structured information from resumes accurately.
  Always respond with valid JSON only — no markdown, no explanation.`,
  
      user: `Extract the following from this resume and return as JSON:
  {
    "name": "candidate full name",
    "email": "email if present, else null",
    "currentRole": "most recent job title",
    "yearsOfExperience": number,
    "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "highlights": "2-3 sentence summary of the candidate's strongest points for an interviewer"
  }
  
  Resume:
  ${resumeText}`,
    }
  }