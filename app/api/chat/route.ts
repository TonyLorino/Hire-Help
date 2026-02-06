import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { DEPLOYMENT } from "@/lib/openai";
import OpenAI from "openai";
import type { ChatMessage } from "@/types";

// Lazy initialization for streaming client
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

function buildSystemContext(context: any): string {
  let systemContext = `You are an AI hiring assistant helping with resume review and candidate evaluation.

You have access to the following context:
`;

  if (context.jobDescription) {
    systemContext += `
## Job Description:
${context.jobDescription.substring(0, 3000)}
`;
  }

  if (context.candidates?.length > 0) {
    systemContext += `
## Candidates (${context.candidates.length}):
${context.candidates.map((c: any) => `- ${c.name}`).join("\n")}
`;
  }

  if (context.selectedCandidate) {
    systemContext += `
## Currently Selected Candidate: ${context.selectedCandidate.name}
Resume Summary: The user has focused on this specific candidate for questions.
Resume: ${context.selectedCandidate.text?.substring(0, 2000) || "Not available"}
`;
  }

  if (context.analysisResults) {
    systemContext += `
## Analysis Results Available:
- Candidate summaries: ${context.analysisResults.summaries?.length || 0}
- JD match analyses: ${context.analysisResults.jdMatches?.length || 0}
- Comparisons: ${context.analysisResults.comparisons?.length || 0}
`;

    // Include JD match for selected candidate if available
    if (context.selectedCandidate && context.analysisResults.jdMatches) {
      const match = context.analysisResults.jdMatches.find(
        (m: any) => m.candidateId === context.selectedCandidate.id || m.name === context.selectedCandidate.name
      );
      if (match) {
        systemContext += `
## Selected Candidate JD Match:
- Matches: ${match.goodMatches?.slice(0, 5).join(", ")}
- Gaps: ${match.gaps?.slice(0, 5).join(", ")}
- Ranking: ${match.ranking}
`;
      }
    }
  }

  systemContext += `

## Your Role:
- Help analyze job descriptions and suggest improvements
- Compare candidates against job requirements
- Generate interview questions tailored to specific candidates
- Analyze interview notes and provide recommendations
- Generate professional emails for hiring managers, offers, rejections, and next steps
- Answer questions about candidates, qualifications, and hiring decisions

## Response Formatting:
- Use markdown formatting for clarity
- Use **bold** for emphasis
- Use bullet points for lists
- Use headers (##) to organize longer responses
- Keep responses professional and scannable

## Special Instructions:
When a user asks you to generate a hiring manager email or responds "yes" to generating an email:
1. Create a complete, professional email template
2. Include a clear subject line
3. Write 2-3 concise paragraphs summarizing the candidate
4. Include 5-10 bullet points for strengths/matches
5. Include 5-10 bullet points for concerns/gaps
6. End with a clear recommendation and suggested next steps

Be concise, professional, and helpful. When discussing specific candidates, reference their qualifications and how they match the job requirements.`;

  return systemContext;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, history, stream: useStream } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemContext = buildSystemContext(context);

    // Build message history
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemContext },
    ];

    // Add history (last few messages for context)
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((msg: ChatMessage) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Detect context type for potential follow-up actions
    let responseContext: { type: string } | undefined;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("interview notes") || lowerMessage.includes("after the interview")) {
      responseContext = { type: "post-interview" };
    } else if (lowerMessage.includes("interview question") || lowerMessage.includes("interview prep")) {
      responseContext = { type: "interview-prep" };
    } else if (lowerMessage.includes("job description") || lowerMessage.includes("jd")) {
      responseContext = { type: "jd-analysis" };
    } else if (context.candidates?.length > 0) {
      responseContext = { type: "resume-analysis" };
    }

    // Use streaming if requested
    if (useStream) {
      const openaiClient = getOpenAIClient();
      
      // Convert messages to Responses API input format
      const input = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const stream = await (openaiClient as any).responses.create({
        model: DEPLOYMENT,
        input,
        temperature: 0.7,
        max_output_tokens: 2000,
        stream: true,
      });

      // Create a TransformStream to encode our data
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              // Handle Responses API streaming events
              if (event.type === 'response.output_text.delta') {
                const content = event.delta || "";
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              }
            }
            // Send context at the end
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, context: responseContext })}\n\n`));
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
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming response (fallback)
    const response = await chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      response,
      context: responseContext,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
