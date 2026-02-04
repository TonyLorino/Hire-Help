import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPTS, USER_PROMPTS } from "@/lib/prompts";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, candidateId, candidateName, resumeText, matchInfo } =
      await request.json();

    if (!jobDescription || !candidateName || !resumeText) {
      return NextResponse.json(
        { error: "Job description, candidate name, and resume are required" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPTS.INTERVIEW_PREP },
        {
          role: "user",
          content: USER_PROMPTS.generateInterviewPrep(
            jobDescription,
            candidateName,
            resumeText,
            matchInfo
          ),
        },
      ],
      { responseFormat: "json", temperature: 0.7, maxTokens: 4000 }
    );

    const prep = JSON.parse(response);

    // Ensure all questions have IDs
    prep.questions = prep.questions.map((q: any) => ({
      ...q,
      id: q.id || generateId(),
    }));

    prep.candidateId = candidateId;

    return NextResponse.json(prep);
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview prep" },
      { status: 500 }
    );
  }
}
