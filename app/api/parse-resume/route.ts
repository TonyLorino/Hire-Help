import { NextRequest, NextResponse } from "next/server";
import { parseFile, extractCandidateName, extractLocation } from "@/lib/file-parser";
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseFile(buffer, file.name);

    // Default values
    let candidateName = "Unknown Candidate";
    let location = "Location not specified";

    // Always use AI extraction as primary method (more reliable)
    try {
      const response = await chatCompletion(
        [
          {
            role: "system",
            content: "You are an expert at extracting structured information from resumes. Always respond with valid JSON. Extract the candidate's actual name, not section headers like 'Professional Summary'.",
          },
          {
            role: "user",
            content: USER_PROMPTS.extractCandidateInfo(text),
          },
        ],
        { responseFormat: "json", temperature: 0.3 }
      );

      const extracted = JSON.parse(response);
      
      // Use AI results if valid
      if (extracted.name && 
          extracted.name !== "Unknown" && 
          extracted.name.length > 0 &&
          !isLikelySectionHeader(extracted.name)) {
        candidateName = extracted.name;
      }
      if (extracted.location && extracted.location !== "Unknown" && extracted.location.length > 0) {
        location = extracted.location;
      }
    } catch (aiError) {
      console.error("AI extraction error:", aiError);
      // Fall back to regex extraction if AI fails
      candidateName = extractCandidateName(text);
      location = extractLocation(text);
    }

    // Final fallback: use regex if AI returned unknown
    if (candidateName === "Unknown Candidate") {
      const regexName = extractCandidateName(text);
      if (regexName !== "Unknown Candidate") {
        candidateName = regexName;
      }
    }
    if (location === "Location not specified") {
      const regexLocation = extractLocation(text);
      if (regexLocation !== "Location not specified") {
        location = regexLocation;
      }
    }

    return NextResponse.json({
      text,
      candidateName,
      location,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}

/**
 * Check if a string looks like a resume section header rather than a name
 */
function isLikelySectionHeader(text: string): boolean {
  const headers = [
    "professional summary",
    "executive summary",
    "summary",
    "objective",
    "career objective",
    "experience",
    "work experience",
    "education",
    "skills",
    "work history",
    "career",
    "profile",
    "about me",
    "contact",
    "contact information",
  ];
  return headers.includes(text.toLowerCase().trim());
}
