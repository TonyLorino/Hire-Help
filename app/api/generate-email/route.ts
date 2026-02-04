import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { candidateName, emailType, context } = await request.json();

    if (!candidateName || !emailType) {
      return NextResponse.json(
        { error: "Candidate name and email type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["next-steps", "offer", "rejection"];
    if (!validTypes.includes(emailType)) {
      return NextResponse.json(
        { error: "Invalid email type" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a professional HR communications specialist. Generate polished, empathetic, and professional emails.",
        },
        {
          role: "user",
          content: USER_PROMPTS.generateEmail(candidateName, emailType, context || ""),
        },
      ],
      { responseFormat: "json", temperature: 0.6 }
    );

    const email = JSON.parse(response);

    return NextResponse.json(email);
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
