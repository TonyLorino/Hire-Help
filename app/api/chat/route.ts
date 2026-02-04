import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPTS, USER_PROMPTS } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build system context
    let systemContext = `You are an AI hiring assistant helping with resume review and candidate evaluation.

You have access to the following context:
`;

    if (context.jobDescription) {
      systemContext += `
## Job Description:
${context.jobDescription}
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
`;
    }

    if (context.analysisResults) {
      systemContext += `
## Analysis Results Available:
- Candidate summaries: ${context.analysisResults.summaries?.length || 0}
- JD match analyses: ${context.analysisResults.jdMatches?.length || 0}
- Comparisons: ${context.analysisResults.comparisons?.length || 0}
`;
    }

    systemContext += `

## Your Role:
- Help analyze job descriptions and suggest improvements
- Compare candidates against job requirements
- Generate interview questions tailored to specific candidates
- Analyze interview notes and provide recommendations
- Generate professional emails (offers, rejections, next steps)
- Answer questions about candidates, qualifications, and hiring decisions

Be concise, professional, and helpful. When discussing specific candidates, reference their qualifications and how they match the job requirements.`;

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

    // Get response
    const response = await chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Detect context type for potential follow-up actions
    let responseContext;
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
