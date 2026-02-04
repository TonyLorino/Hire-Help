import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPTS, USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPTS.JD_ANALYZER },
        { role: "user", content: USER_PROMPTS.analyzeJD(jobDescription) },
      ],
      { responseFormat: "json", temperature: 0.5 }
    );

    const analysis = JSON.parse(response);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("JD analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job description" },
      { status: 500 }
    );
  }
}
