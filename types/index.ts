// Core application types

export type RankingLevel = "best" | "better" | "good" | "bad";
export type RecommendationLevel = "concentrate" | "consider" | "eliminate";
export type InterviewDecision = "advance" | "hold" | "reject";

export interface Candidate {
  id: string;
  name: string;
  location: string;
  resumeText: string;
  fileName: string;
  uploadedAt: Date;
}

export interface CandidateSummary {
  candidateId: string;
  name: string;
  location: string;
  summary: string; // 2 paragraph summary
}

export interface JDMatchAnalysis {
  candidateId: string;
  name: string;
  goodMatches: string[]; // Bullet points of matching qualifications
  gaps: string[]; // Where candidate falls short
  ranking: RankingLevel;
}

export interface CandidateComparison {
  candidateId: string;
  name: string;
  summary: string; // 3-4 sentence overview
  experienceComparison: string; // Relative to other candidates
  jdMatchPercent: number;
  rank: number;
  recommendation: RecommendationLevel;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  reason: string; // Why ask this
  whatToLookFor: string;
  category: "icebreaker" | "jd-specific" | "candidate-specific";
  notes?: string; // For user to fill in
}

export interface InterviewPrep {
  candidateId: string;
  candidateName: string;
  summary: string;
  matchOverview: string;
  gapOverview: string;
  questions: InterviewQuestion[];
}

export interface PostInterviewAnalysis {
  candidateId: string;
  candidateName: string;
  assessment: string; // 2-3 paragraph assessment
  summary: string; // 3-4 line summary
  jdMatches: string[];
  jdGaps: string[];
  decision: InterviewDecision;
  decisionRationale: string;
}

export interface InterviewNotes {
  candidateId: string;
  notes: string;
  analyzedAt?: Date;
}

export interface InterviewNotesAnalysis {
  candidateId: string;
  candidateName: string;
  synopsis: string; // 2-3 paragraph summary combining all data
  interviewMatches: string[]; // Matches found during interview
  interviewGaps: string[]; // Gaps identified during interview
  resumeMatches: string[]; // Matches from resume
  resumeGaps: string[]; // Gaps from resume
  overallAssessment: string;
  recommendation: InterviewDecision;
  nextSteps: string[];
}

export interface HiringManagerEmail {
  candidateId: string;
  subject: string;
  body: string;
  generatedAt: Date;
}

export interface CandidateFinalSummary {
  paragraph: string; // 3-5 sentences
  bulletPoints: string[]; // 3-8 bullets
  recommendation: InterviewDecision;
}

export interface AnalysisResults {
  summaries: CandidateSummary[];
  jdMatches: JDMatchAnalysis[];
  comparisons: CandidateComparison[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: {
    type: "jd-analysis" | "resume-analysis" | "interview-prep" | "post-interview";
    candidateId?: string;
  };
}

export interface JDAnalysis {
  overview: string;
  strengths: string[];
  improvements: string[];
  suggestedUpdates: string[];
}

export interface JobDescriptionInfo {
  jobTitle: string;
  company: string | null;
  location: string | null;
  department: string | null;
}

export type ActiveTab = "setup" | "summary" | "jd-match" | "comparison" | "interview" | "recommendations";

export interface AppState {
  // Job Description
  jobDescription: string;
  jobInfo: JobDescriptionInfo | null;
  jdAnalysis: JDAnalysis | null;
  
  // Candidates
  candidates: Candidate[];
  analysisResults: AnalysisResults | null;
  
  // Interview Prep
  interviewPreps: Map<string, InterviewPrep>;
  postInterviewAnalyses: Map<string, PostInterviewAnalysis>;
  
  // Interview Notes
  interviewNotes: Map<string, InterviewNotes>;
  interviewNotesAnalyses: Map<string, InterviewNotesAnalysis>;
  hiringManagerEmails: Map<string, HiringManagerEmail>;
  
  // Chat
  chatMessages: ChatMessage[];
  selectedCandidateId: string | null;
  
  // UI State
  isLoading: boolean;
  loadingMessage: string;
  activeTab: ActiveTab;
  sidebarExpanded: boolean;
}
