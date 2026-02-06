import { NextRequest } from "next/server";
import { DEPLOYMENT } from "@/lib/openai";
import OpenAI from "openai";
import type { InterviewNotesAnalysis, JDMatchAnalysis } from "@/types";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;

    if (!apiKey || !resourceName) {
      throw new Error("Azure OpenAI configuration is missing.");
    }

    client = new OpenAI({
      apiKey,
      baseURL: `https://${resourceName}.openai.azure.com/openai/v1/`,
    });
  }
  return client;
}

const SYSTEM_PROMPT = `You are a professional HR communications specialist. Your role is to create clear, concise, and professional email templates for hiring managers.

Write in a professional but approachable tone. Focus on actionable insights and clear recommendations. Keep the email scannable with good use of formatting.`;

function buildUserPrompt(
  candidateName: string,
  jobTitle: string,
  interviewNotes: string,
  analysis?: InterviewNotesAnalysis,
  jdMatch?: JDMatchAnalysis
): string {
  let prompt = `Generate a professional email template for a hiring manager summarizing a candidate interview.

## Candidate: ${candidateName}
## Position: ${jobTitle}

## Interview Notes Summary
${interviewNotes.substring(0, 3000)}
`;

  if (analysis) {
    prompt += `
## Interview Analysis
Synopsis: ${analysis.synopsis}
Recommendation: ${analysis.recommendation}
Key Matches: ${analysis.interviewMatches.slice(0, 5).join(", ")}
Key Concerns: ${analysis.interviewGaps.slice(0, 5).join(", ")}
`;
  }

  if (jdMatch) {
    prompt += `
## JD Match Analysis
Ranking: ${jdMatch.ranking}
Good Matches: ${jdMatch.goodMatches.slice(0, 5).join(", ")}
Gaps: ${jdMatch.gaps.slice(0, 5).join(", ")}
`;
  }

  prompt += `

Create an email with the following structure:

**Subject Line**: Clear, concise subject indicating this is a candidate summary

**Email Body** (2-3 paragraphs):
- Opening paragraph: Brief intro and overall impression/recommendation
- Middle paragraph: Key highlights and how the candidate fits the role
- Closing paragraph: Concerns/areas to explore and suggested next steps

**Matches** (5-10 bullet points):
List specific strengths and qualifications that align with the role

**Areas of Concern** (5-10 bullet points):
List gaps or areas that need further exploration

**Recommendation Section**:
- Clear recommendation (Advance/Hold/Reject)
- Suggested next steps for the hiring process
- Any specific areas to probe in future interviews

Format the email professionally using markdown. Use **bold** for emphasis, headers for sections, and bullet points for lists.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const {
      candidateId,
      candidateName,
      jobTitle,
      interviewNotes,
      analysis,
      jdMatch,
      stream: useStream,
    } = await request.json();

    if (!candidateName || !interviewNotes) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const input = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: buildUserPrompt(
          candidateName,
          jobTitle || "the position",
          interviewNotes,
          analysis,
          jdMatch
        ),
      },
    ];

    if (useStream) {
      const openaiClient = getOpenAIClient();

      const stream = await (openaiClient as any).responses.create({
        model: DEPLOYMENT,
        input,
        temperature: 0.6,
        max_output_tokens: 2500,
        stream: true,
      });

      const encoder = new TextEncoder();
      let fullContent = "";

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === 'response.output_text.delta') {
                const content = event.delta || "";
                if (content) {
                  fullContent += content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              }
            }

            // Extract subject and body for structured storage
            const emailData = parseEmail(candidateId, fullContent);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true, email: emailData })}\n\n`
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
    const openaiClient = getOpenAIClient();
    const response = await (openaiClient as any).responses.create({
      model: DEPLOYMENT,
      input,
      temperature: 0.6,
      max_output_tokens: 2500,
    });

    const content = response.output_text || "";
    const emailData = parseEmail(candidateId, content);

    return new Response(JSON.stringify({ content, email: emailData }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Hiring email generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function parseEmail(
  candidateId: string,
  content: string
): { candidateId: string; subject: string; body: string; generatedAt: Date } {
  // Try to extract subject line
  const subjectMatch = content.match(
    /(?:\*\*)?Subject(?:\s*Line)?(?:\*\*)?[:\s]*(.+?)(?:\n|$)/i
  );
  const subject = subjectMatch
    ? subjectMatch[1].replace(/^\*\*|\*\*$/g, "").trim()
    : "Candidate Interview Summary";

  // Get everything after the subject as the body
  let body = content;
  if (subjectMatch) {
    const subjectIndex = content.indexOf(subjectMatch[0]);
    body = content.substring(subjectIndex + subjectMatch[0].length).trim();
  }

  return {
    candidateId,
    subject,
    body,
    generatedAt: new Date(),
  };
}
