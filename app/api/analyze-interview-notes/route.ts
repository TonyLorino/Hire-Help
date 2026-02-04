import { NextRequest } from "next/server";
import { DEPLOYMENT } from "@/lib/openai";
import { AzureOpenAI } from "openai";
import type { JDMatchAnalysis, InterviewNotesAnalysis } from "@/types";

let azureClient: AzureOpenAI | null = null;

function getAzureOpenAIClient(): AzureOpenAI {
  if (!azureClient) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";

    if (!apiKey || !endpoint) {
      throw new Error("Azure OpenAI configuration is missing.");
    }

    azureClient = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion,
    });
  }
  return azureClient;
}

const SYSTEM_PROMPT = `You are a senior HR professional and talent evaluator. Your role is to synthesize interview notes with resume data and job requirements to provide comprehensive candidate assessments.

Be thorough, objective, and actionable in your analysis. Provide clear recommendations backed by specific evidence from the interview and resume.

Format your response using clear markdown:
- Use headers (##) to organize sections
- Use bullet points for lists
- Use bold (**text**) for emphasis
- Keep paragraphs concise and readable`;

function buildUserPrompt(
  candidateName: string,
  notes: string,
  resumeText: string,
  jobDescription: string,
  jdMatchAnalysis?: JDMatchAnalysis
): string {
  let prompt = `Analyze the following candidate based on their interview notes, resume, and the job description.

## Candidate: ${candidateName}

## Interview Notes
${notes}

## Resume
${resumeText.substring(0, 6000)}

## Job Description
${jobDescription.substring(0, 4000)}
`;

  if (jdMatchAnalysis) {
    prompt += `
## Previous JD Match Analysis
Matches: ${jdMatchAnalysis.goodMatches.join(", ")}
Gaps: ${jdMatchAnalysis.gaps.join(", ")}
Ranking: ${jdMatchAnalysis.ranking}
`;
  }

  prompt += `

Please provide a comprehensive analysis including:

## Interview Synopsis
Provide a 2-3 paragraph summary that synthesizes the interview findings with the resume and job requirements. Highlight key observations, strengths demonstrated, and areas of concern.

## Match Analysis

### Strengths Demonstrated in Interview
List 5-10 specific ways the candidate demonstrated alignment with job requirements during the interview.

### Areas of Concern from Interview  
List 5-10 gaps or concerns identified during the interview, including skills, experience, or behavioral indicators.

### Resume Matches to JD
List 5-10 ways the candidate's resume aligns with the job description.

### Resume Gaps
List 5-10 areas where the resume shows gaps relative to job requirements.

## Overall Assessment
Provide a clear, actionable assessment including:
- Overall recommendation (Advance / Hold / Reject)
- Key decision factors
- Suggested next steps or areas to explore in further interviews

## Comparison Table
Create a markdown table summarizing the candidate's match to key requirements:

| Requirement | Status | Evidence |
|-------------|--------|----------|
| (key requirement) | Met/Partial/Gap | (brief evidence) |

---

At the end of your analysis, ask: "Would you like me to generate a hiring manager email template summarizing this candidate?"`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const {
      candidateId,
      candidateName,
      notes,
      resumeText,
      jobDescription,
      jdMatchAnalysis,
      stream: useStream,
    } = await request.json();

    if (!notes || !candidateName || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: buildUserPrompt(
          candidateName,
          notes,
          resumeText || "",
          jobDescription,
          jdMatchAnalysis
        ),
      },
    ];

    if (useStream) {
      const client = getAzureOpenAIClient();

      const stream = await client.chat.completions.create({
        model: DEPLOYMENT,
        messages,
        temperature: 0.6,
        max_tokens: 4000,
        stream: true,
      });

      const encoder = new TextEncoder();
      let fullContent = "";

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            }

            // Parse the analysis to extract structured data
            const analysis = parseAnalysis(candidateId, candidateName, fullContent);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true, analysis })}\n\n`
              )
            );
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback
    const client = getAzureOpenAIClient();
    const response = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages,
      temperature: 0.6,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "";
    const analysis = parseAnalysis(candidateId, candidateName, content);

    return new Response(JSON.stringify({ content, analysis }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Interview notes analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze interview notes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function parseAnalysis(
  candidateId: string,
  candidateName: string,
  content: string
): InterviewNotesAnalysis {
  // Extract bullet points from different sections
  const extractBullets = (section: string, content: string): string[] => {
    const regex = new RegExp(`##\\s*${section}[\\s\\S]*?(?=##|$)`, "i");
    const match = content.match(regex);
    if (!match) return [];

    const bullets = match[0].match(/[-•]\s*(.+?)(?=\n|$)/g) || [];
    return bullets
      .map((b) => b.replace(/^[-•]\s*/, "").trim())
      .filter((b) => b.length > 0)
      .slice(0, 10);
  };

  // Extract synopsis (first major paragraph after synopsis header)
  const extractSynopsis = (content: string): string => {
    const synopsisMatch = content.match(
      /##\s*Interview Synopsis\s*([\s\S]*?)(?=##|$)/i
    );
    if (synopsisMatch) {
      return synopsisMatch[1].trim().substring(0, 2000);
    }
    // Fallback: get first substantial paragraph
    const paragraphs = content.split(/\n\n+/);
    return paragraphs.find((p) => p.length > 100)?.trim() || "";
  };

  // Extract recommendation
  const extractRecommendation = (
    content: string
  ): "advance" | "hold" | "reject" => {
    const lower = content.toLowerCase();
    if (lower.includes("recommend: advance") || lower.includes("recommendation: advance")) {
      return "advance";
    }
    if (lower.includes("recommend: reject") || lower.includes("recommendation: reject")) {
      return "reject";
    }
    if (lower.includes("advance") && !lower.includes("hold") && !lower.includes("reject")) {
      return "advance";
    }
    if (lower.includes("reject") && !lower.includes("advance")) {
      return "reject";
    }
    return "hold";
  };

  // Extract next steps
  const extractNextSteps = (content: string): string[] => {
    const nextStepsMatch = content.match(
      /(?:next steps|suggested next steps|areas to explore)[:\s]*([\s\S]*?)(?=##|\n\n|$)/i
    );
    if (nextStepsMatch) {
      const bullets = nextStepsMatch[1].match(/[-•\d.]\s*(.+?)(?=\n|$)/g) || [];
      return bullets
        .map((b) => b.replace(/^[-•\d.]\s*/, "").trim())
        .filter((b) => b.length > 0)
        .slice(0, 5);
    }
    return [];
  };

  return {
    candidateId,
    candidateName,
    synopsis: extractSynopsis(content),
    interviewMatches: extractBullets("Strengths Demonstrated in Interview", content),
    interviewGaps: extractBullets("Areas of Concern from Interview", content),
    resumeMatches: extractBullets("Resume Matches to JD", content),
    resumeGaps: extractBullets("Resume Gaps", content),
    overallAssessment: extractBullets("Overall Assessment", content).join(" "),
    recommendation: extractRecommendation(content),
    nextSteps: extractNextSteps(content),
  };
}
