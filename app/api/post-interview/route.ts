import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPTS, USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, candidateId, candidateName, resumeText, interviewNotes } =
      await request.json();

    if (!jobDescription || !candidateName || !resumeText || !interviewNotes) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPTS.POST_INTERVIEW },
        {
          role: "user",
          content: USER_PROMPTS.analyzePostInterview(
            jobDescription,
            candidateName,
            resumeText,
            interviewNotes
          ),
        },
      ],
      { responseFormat: "json", temperature: 0.5, maxTokens: 4000 }
    );

    const analysis = JSON.parse(response);
    analysis.candidateId = candidateId;

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Post-interview analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze interview" },
      { status: 500 }
    );
  }
}
