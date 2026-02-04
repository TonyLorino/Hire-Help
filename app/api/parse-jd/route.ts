import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/file-parser";
import { chatCompletion } from "@/lib/openai";
import { USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Parse the file to get text
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseFile(buffer, file.name);

    // Use AI to extract job information
    let jobInfo = {
      jobTitle: "Untitled Position",
      company: null as string | null,
      location: null as string | null,
      department: null as string | null,
    };

    try {
      const response = await chatCompletion(
        [
          {
            role: "system",
            content: "You are an expert at extracting structured information from job descriptions. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: USER_PROMPTS.extractJobInfo(text),
          },
        ],
        { responseFormat: "json", temperature: 0.3 }
      );

      const extracted = JSON.parse(response);
      jobInfo = {
        jobTitle: extracted.jobTitle || "Untitled Position",
        company: extracted.company || null,
        location: extracted.location || null,
        department: extracted.department || null,
      };
    } catch (aiError) {
      console.error("AI extraction error:", aiError);
      // Continue with default jobInfo if AI fails
    }

    return NextResponse.json({
      text,
      jobInfo,
    });
  } catch (error) {
    console.error("JD parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse job description" },
      { status: 500 }
    );
  }
}
