import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { SYSTEM_PROMPTS, USER_PROMPTS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumes } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json(
        { error: "At least one resume is required" },
        { status: 400 }
      );
    }

    const response = await chatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPTS.RESUME_ANALYZER },
        {
          role: "user",
          content: USER_PROMPTS.analyzeResumes(jobDescription, resumes),
        },
      ],
      { responseFormat: "json", temperature: 0.5, maxTokens: 8000 }
    );

    const results = JSON.parse(response);

    // Build a name-to-id lookup for matching AI results to candidates
    // Use lowercase for case-insensitive matching
    const nameToId = new Map<string, string>();
    const nameToStoredName = new Map<string, string>();
    
    for (const r of resumes) {
      const normalizedName = r.name.toLowerCase().trim();
      nameToId.set(normalizedName, r.id);
      nameToStoredName.set(normalizedName, r.name);
    }

    // Helper to find candidate ID by name (with fuzzy matching)
    const findCandidateId = (aiName: string): string | null => {
      const normalizedAiName = aiName.toLowerCase().trim();
      
      // Exact match
      if (nameToId.has(normalizedAiName)) {
        return nameToId.get(normalizedAiName) || null;
      }
      
      // Partial match (AI name contains stored name or vice versa)
      for (const [storedName, id] of nameToId.entries()) {
        if (normalizedAiName.includes(storedName) || storedName.includes(normalizedAiName)) {
          return id;
        }
      }
      
      return null;
    };

    // Helper to get stored name by candidate ID
    const getStoredName = (candidateId: string): string | null => {
      const resume = resumes.find((r: any) => r.id === candidateId);
      return resume?.name || null;
    };

    // Map results by name instead of index, and use stored names
    const mappedResults = {
      summaries: results.summaries.map((s: any) => {
        const candidateId = findCandidateId(s.name) || s.candidateId;
        const storedName = getStoredName(candidateId) || s.name;
        return {
          ...s,
          candidateId,
          name: storedName,
        };
      }),
      jdMatches: results.jdMatches.map((m: any) => {
        const candidateId = findCandidateId(m.name) || m.candidateId;
        const storedName = getStoredName(candidateId) || m.name;
        return {
          ...m,
          candidateId,
          name: storedName,
        };
      }),
      comparisons: results.comparisons.map((c: any) => {
        const candidateId = findCandidateId(c.name) || c.candidateId;
        const storedName = getStoredName(candidateId) || c.name;
        return {
          ...c,
          candidateId,
          name: storedName,
        };
      }),
    };

    return NextResponse.json(mappedResults);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resumes" },
      { status: 500 }
    );
  }
}
