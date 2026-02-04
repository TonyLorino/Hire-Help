import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { candidateName, assessment, decision } = await request.json();

    if (!candidateName || !assessment || !decision) {
      return NextResponse.json(
        { error: "Candidate name, assessment, and decision are required" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are an HR professional creating concise candidate summaries for stakeholder review.",
        },
        {
          role: "user",
          content: USER_PROMPTS.generateFinalSummary(candidateName, assessment, decision),
        },
      ],
      { responseFormat: "json", temperature: 0.5 }
    );

    const summary = JSON.parse(response);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
