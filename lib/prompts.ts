// AI Prompt Templates for Resume Compare

export const SYSTEM_PROMPTS = {
  JD_ANALYZER: `You are an expert HR consultant and job description analyst. Your role is to:
- Analyze job descriptions for clarity, completeness, and effectiveness
- Identify potential gaps or areas for improvement
- Suggest specific, actionable updates
- Consider market standards and best practices

Provide constructive, professional feedback that helps improve candidate quality and reduce mismatches.`,

  RESUME_ANALYZER: `You are an expert recruiter and talent evaluator. Your role is to:
- Thoroughly analyze resumes against job requirements
- Identify matches and gaps objectively
- Provide fair, unbiased rankings based on qualifications
- Generate insightful summaries that help hiring managers make informed decisions

Be thorough but concise. Focus on relevant qualifications and experience.`,

  INTERVIEW_PREP: `You are an experienced hiring manager and interview coach. Your role is to:
- Generate thoughtful, relevant interview questions
- Tailor questions to both the job requirements and candidate background
- Provide guidance on what to look for in responses
- Include a mix of behavioral, technical, and cultural fit questions

Create questions that reveal candidate potential and help assess job fit.`,

  POST_INTERVIEW: `You are a senior HR professional specializing in candidate evaluation. Your role is to:
- Synthesize interview notes with resume and job requirements
- Provide objective, actionable assessments
- Make clear recommendations with supporting rationale
- Help hiring teams make confident decisions

Be direct and constructive in your feedback.`,
};

export const USER_PROMPTS = {
  analyzeJD: (jobDescription: string) => `
Please analyze the following job description and provide:

1. **Overview**: A brief assessment of the JD's overall quality (2-3 sentences)
2. **Strengths**: What the JD does well (3-5 bullet points)
3. **Areas for Improvement**: What could be better (3-5 bullet points)
4. **Suggested Updates**: Specific recommendations to improve the JD (3-5 actionable suggestions)

Job Description:
${jobDescription}

Respond in JSON format:
{
  "overview": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "suggestedUpdates": ["string"]
}`,

  analyzeResumes: (jobDescription: string, resumes: { name: string; text: string }[]) => `
Analyze the following resumes against the job description. For each candidate, provide:

1. **Summary**: A 2-paragraph summary covering background, experience, and key qualifications
2. **JD Match**: What qualifications match the job requirements
3. **Gaps**: Where the candidate falls short of requirements
4. **Ranking**: Rate as "best", "better", "good", or "bad" based on overall fit

Also provide a comparative analysis ranking all candidates against each other.

Job Description:
${jobDescription}

Candidates:
${resumes.map((r, i) => `
--- CANDIDATE ${i + 1}: ${r.name} ---
${r.text}
`).join("\n")}

Respond in JSON format:
{
  "summaries": [
    {
      "candidateId": "string (use candidate name as id)",
      "name": "string",
      "location": "string",
      "summary": "string (2 paragraphs)"
    }
  ],
  "jdMatches": [
    {
      "candidateId": "string",
      "name": "string",
      "goodMatches": ["string"],
      "gaps": ["string"],
      "ranking": "best|better|good|bad"
    }
  ],
  "comparisons": [
    {
      "candidateId": "string",
      "name": "string",
      "summary": "string (3-4 sentences)",
      "experienceComparison": "string",
      "jdMatchPercent": number,
      "rank": number,
      "recommendation": "concentrate|consider|eliminate"
    }
  ]
}`,

  generateInterviewPrep: (
    jobDescription: string,
    candidateName: string,
    resumeText: string,
    matchInfo?: { matches: string[]; gaps: string[] }
  ) => `
Generate interview preparation materials for the following candidate:

Candidate: ${candidateName}

Job Description:
${jobDescription}

Resume:
${resumeText}

${matchInfo ? `
Known Matches: ${matchInfo.matches.join(", ")}
Known Gaps: ${matchInfo.gaps.join(", ")}
` : ""}

Provide:
1. **Summary**: Brief candidate summary
2. **Match Overview**: How they match the JD
3. **Gap Overview**: Areas of concern
4. **Interview Questions**: Generate 10-15 questions in these categories:
   - 2-3 Ice breaker questions
   - 4-5 JD-specific questions (related to job requirements)
   - 4-5 Candidate-specific questions (based on their unique background)

For each question, explain why it should be asked and what to look for in the response.

Respond in JSON format:
{
  "candidateId": "string",
  "candidateName": "string",
  "summary": "string",
  "matchOverview": "string",
  "gapOverview": "string",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "reason": "string",
      "whatToLookFor": "string",
      "category": "icebreaker|jd-specific|candidate-specific"
    }
  ]
}`,

  analyzePostInterview: (
    jobDescription: string,
    candidateName: string,
    resumeText: string,
    interviewNotes: string
  ) => `
Analyze this candidate based on their resume, the job description, and interview notes.

Candidate: ${candidateName}

Job Description:
${jobDescription}

Resume:
${resumeText}

Interview Notes:
${interviewNotes}

Provide:
1. **Assessment**: 2-3 paragraph analysis combining all information
2. **Summary**: 3-4 line summary
3. **JD Matches**: Where they meet requirements (based on interview + resume)
4. **JD Gaps**: Where they fall short (based on interview + resume)
5. **Decision**: "advance" (move to next round), "hold" (need more info), or "reject"
6. **Rationale**: Why this decision

Respond in JSON format:
{
  "candidateId": "string",
  "candidateName": "string",
  "assessment": "string",
  "summary": "string",
  "jdMatches": ["string"],
  "jdGaps": ["string"],
  "decision": "advance|hold|reject",
  "decisionRationale": "string"
}`,

  generateFinalSummary: (
    candidateName: string,
    assessment: string,
    decision: string
  ) => `
Create a final summary for ${candidateName} that can be shared with stakeholders.

Assessment:
${assessment}

Decision: ${decision}

Generate:
1. A 3-5 sentence paragraph summarizing the candidate and recommendation
2. 3-8 bullet points highlighting key findings
3. Clear recommendation

Respond in JSON format:
{
  "paragraph": "string",
  "bulletPoints": ["string"],
  "recommendation": "advance|hold|reject"
}`,

  generateEmail: (
    candidateName: string,
    emailType: "next-steps" | "offer" | "rejection",
    context: string
  ) => `
Generate a professional email for ${candidateName}.

Email Type: ${emailType}
Context: ${context}

${emailType === "next-steps" ? "This email should inform the candidate about moving to the next interview round." : ""}
${emailType === "offer" ? "This email should extend a job offer (placeholder for specific details)." : ""}
${emailType === "rejection" ? "This email should professionally decline the candidate while being respectful and encouraging." : ""}

Provide a complete, professional email that can be customized and sent.

Respond in JSON format:
{
  "subject": "string",
  "body": "string"
}`,

  chat: (
    context: {
      jobDescription: string;
      candidates?: { name: string; text: string }[];
      currentQuestion: string;
    }
  ) => `
You are helping with resume review and hiring decisions.

${context.jobDescription ? `Job Description:\n${context.jobDescription}\n` : ""}
${context.candidates?.length ? `
Candidates:
${context.candidates.map((c) => `- ${c.name}`).join("\n")}
` : ""}

User Question: ${context.currentQuestion}

Provide a helpful, professional response. If you need more information, ask clarifying questions.`,

  extractJobInfo: (jdText: string) => `
Extract the following information from this job description:
- Job title (the specific role being hired for)
- Company name (if mentioned)
- Job location (city, state, or remote if specified)
- Department (if mentioned)

Job Description:
${jdText.substring(0, 4000)}

Respond in JSON format:
{
  "jobTitle": "string (the job title)",
  "company": "string or null",
  "location": "string or null", 
  "department": "string or null"
}`,

  extractCandidateInfo: (resumeText: string) => `
Extract the following information from this resume:
- Full name of the candidate
- Location (city, state/country)
- Email address
- Phone number

Resume:
${resumeText.substring(0, 4000)}

Respond in JSON format:
{
  "name": "string (full name)",
  "location": "string",
  "email": "string or null",
  "phone": "string or null"
}`,
};
