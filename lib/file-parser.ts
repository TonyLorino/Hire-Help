import pdf from "pdf-parse";
import mammoth from "mammoth";

export interface ParsedFile {
  text: string;
  candidateName: string;
  location: string;
}

/**
 * Extract text content from a PDF file
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text.trim();
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Extract text content from a DOCX file
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

/**
 * Parse a file based on its type
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const extension = fileName.toLowerCase().split(".").pop();

  switch (extension) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
    case "doc":
      return parseDOCX(buffer);
    case "txt":
      return buffer.toString("utf-8").trim();
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Attempt to extract candidate name from resume text
 * Uses common patterns found in resumes
 */
export function extractCandidateName(text: string): string {
  // Get first few lines where name is typically found
  const lines = text.split("\n").slice(0, 10);
  
  // Common resume section headers to skip
  const skipHeaders = /^(resume|curriculum vitae|cv|contact|contact information|email|phone|address|professional summary|executive summary|summary|summary of qualifications|objective|career objective|experience|work experience|employment|education|skills|technical skills|work history|career|profile|professional profile|about me|about|qualifications|core competencies|certifications|references)/i;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and common headers
    if (!trimmed || trimmed.length < 2) continue;
    if (skipHeaders.test(trimmed)) continue;
    
    // Look for a line that looks like a name (2-4 words, capitalized)
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if words look like names (capitalized, no special chars)
      const looksLikeName = words.every(
        (word) => /^[A-Z][a-zA-Z'-]+$/.test(word) || /^[A-Z]\.?$/.test(word)
      );
      
      if (looksLikeName) {
        return trimmed;
      }
    }
  }
  
  return "Unknown Candidate";
}

/**
 * Attempt to extract location from resume text
 */
export function extractLocation(text: string): string {
  // Common location patterns
  const patterns = [
    // City, State format
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})\b/,
    // City, State ZIP
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})\s*\d{5}/,
    // Full state names
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)/i,
  ];

  // Check first 20 lines for location
  const lines = text.split("\n").slice(0, 20).join("\n");
  
  for (const pattern of patterns) {
    const match = lines.match(pattern);
    if (match) {
      return `${match[1]}, ${match[2]}`;
    }
  }
  
  return "Location not specified";
}

/**
 * Parse resume file and extract metadata
 */
export async function parseResume(
  buffer: Buffer,
  fileName: string
): Promise<ParsedFile> {
  const text = await parseFile(buffer, fileName);
  const candidateName = extractCandidateName(text);
  const location = extractLocation(text);

  return {
    text,
    candidateName,
    location,
  };
}
