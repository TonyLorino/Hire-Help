import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType } from "docx";
import type { InterviewPrep, InterviewQuestion } from "@/types";

/**
 * Generate a Word document for interview preparation
 */
export async function generateInterviewPrepDocx(prep: InterviewPrep): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: `Interview Preparation: ${prep.candidateName}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
          }),

          // Summary Section
          new Paragraph({
            text: "Candidate Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: prep.summary,
            spacing: { after: 300 },
          }),

          // Match Overview
          new Paragraph({
            text: "Job Description Match",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: prep.matchOverview,
            spacing: { after: 300 },
          }),

          // Gap Overview
          new Paragraph({
            text: "Areas to Explore",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: prep.gapOverview,
            spacing: { after: 400 },
          }),

          // Questions Table
          new Paragraph({
            text: "Interview Questions",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 300 },
          }),
          createQuestionsTable(prep.questions),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

function createQuestionsTable(questions: InterviewQuestion[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      createTableCell("Question", true),
      createTableCell("Why Ask This", true),
      createTableCell("What to Look For", true),
      createTableCell("Notes", true),
    ],
  });

  const dataRows = questions.map(
    (q) =>
      new TableRow({
        children: [
          createTableCell(q.question),
          createTableCell(q.reason),
          createTableCell(q.whatToLookFor),
          createTableCell(""), // Empty for notes
        ],
      })
  );

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...dataRows],
  });
}

function createTableCell(text: string, isHeader: boolean = false): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            size: isHeader ? 24 : 22,
          }),
        ],
      }),
    ],
    width: {
      size: 25,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    shading: isHeader ? { fill: "E5E7EB" } : undefined,
  });
}

/**
 * Generate HTML content for PDF export (to be rendered by @react-pdf/renderer on client)
 */
export function generateInterviewPrepHTML(prep: InterviewPrep): string {
  const questionsHTML = prep.questions
    .map(
      (q) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${q.question}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${q.reason}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${q.whatToLookFor}</td>
      <td style="padding: 8px; border: 1px solid #ddd; min-width: 150px;"></td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
    h1 { color: #1f2937; }
    h2 { color: #374151; margin-top: 24px; }
    p { color: #4b5563; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f3f4f6; padding: 12px 8px; border: 1px solid #ddd; text-align: left; }
    td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
  </style>
</head>
<body>
  <h1>Interview Preparation: ${prep.candidateName}</h1>
  
  <h2>Candidate Summary</h2>
  <p>${prep.summary}</p>
  
  <h2>Job Description Match</h2>
  <p>${prep.matchOverview}</p>
  
  <h2>Areas to Explore</h2>
  <p>${prep.gapOverview}</p>
  
  <h2>Interview Questions</h2>
  <table>
    <thead>
      <tr>
        <th>Question</th>
        <th>Why Ask This</th>
        <th>What to Look For</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${questionsHTML}
    </tbody>
  </table>
</body>
</html>
  `;
}
