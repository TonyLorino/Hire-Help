import { NextRequest, NextResponse } from "next/server";
import { generateInterviewPrepDocx, generateInterviewPrepHTML } from "@/lib/export";
import type { InterviewPrep } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { prep, format } = (await request.json()) as {
      prep: InterviewPrep;
      format: "pdf" | "docx";
    };

    if (!prep) {
      return NextResponse.json(
        { error: "Interview prep data is required" },
        { status: 400 }
      );
    }

    if (format === "docx") {
      const buffer = await generateInterviewPrepDocx(prep);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="interview-prep-${prep.candidateName.replace(/\s+/g, "-")}.docx"`,
        },
      });
    } else if (format === "pdf") {
      // For PDF, we return HTML that the client can print/save as PDF
      const html = generateInterviewPrepHTML(prep);

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export document" },
      { status: 500 }
    );
  }
}
