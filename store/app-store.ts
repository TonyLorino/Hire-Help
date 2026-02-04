import { create } from "zustand";
import type {
  AppState,
  ActiveTab,
  Candidate,
  JDAnalysis,
  JobDescriptionInfo,
  AnalysisResults,
  InterviewPrep,
  PostInterviewAnalysis,
  InterviewNotes,
  InterviewNotesAnalysis,
  HiringManagerEmail,
  ChatMessage,
} from "@/types";

interface AppStore extends AppState {
  // Job Description Actions
  setJobDescription: (jd: string, info?: JobDescriptionInfo) => void;
  clearJobDescription: () => void;
  setJDAnalysis: (analysis: JDAnalysis | null) => void;
  setJobInfo: (info: JobDescriptionInfo | null) => void;

  // Candidate Actions
  addCandidate: (candidate: Candidate) => void;
  removeCandidate: (id: string) => void;
  clearCandidates: () => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;

  // Interview Prep Actions
  setInterviewPrep: (candidateId: string, prep: InterviewPrep) => void;
  setPostInterviewAnalysis: (candidateId: string, analysis: PostInterviewAnalysis) => void;

  // Interview Notes Actions
  setInterviewNotes: (candidateId: string, notes: string) => void;
  setInterviewNotesAnalysis: (candidateId: string, analysis: InterviewNotesAnalysis) => void;
  setHiringManagerEmail: (candidateId: string, email: HiringManagerEmail) => void;

  // Chat Actions
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, content: string) => void;
  clearChat: () => void;
  setSelectedCandidate: (id: string | null) => void;

  // UI Actions
  setLoading: (loading: boolean, message?: string) => void;
  setActiveTab: (tab: ActiveTab) => void;

  // Reset
  resetAll: () => void;
}

const initialState: AppState = {
  jobDescription: "",
  jobInfo: null,
  jdAnalysis: null,
  candidates: [],
  analysisResults: null,
  interviewPreps: new Map(),
  postInterviewAnalyses: new Map(),
  interviewNotes: new Map(),
  interviewNotesAnalyses: new Map(),
  hiringManagerEmails: new Map(),
  chatMessages: [],
  selectedCandidateId: null,
  isLoading: false,
  loadingMessage: "",
  activeTab: "summary",
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // Job Description Actions
  setJobDescription: (jd, info) => set({ 
    jobDescription: jd,
    jobInfo: info || null,
  }),
  
  clearJobDescription: () => set({ 
    jobDescription: "", 
    jobInfo: null,
    jdAnalysis: null,
    analysisResults: null,
  }),
  
  setJDAnalysis: (analysis) => set({ jdAnalysis: analysis }),
  
  setJobInfo: (info) => set({ jobInfo: info }),

  // Candidate Actions
  addCandidate: (candidate) =>
    set((state) => ({
      candidates: [...state.candidates, candidate],
    })),

  removeCandidate: (id) =>
    set((state) => ({
      candidates: state.candidates.filter((c) => c.id !== id),
      interviewPreps: new Map(
        Array.from(state.interviewPreps.entries()).filter(([key]) => key !== id)
      ),
      postInterviewAnalyses: new Map(
        Array.from(state.postInterviewAnalyses.entries()).filter(([key]) => key !== id)
      ),
      interviewNotes: new Map(
        Array.from(state.interviewNotes.entries()).filter(([key]) => key !== id)
      ),
      interviewNotesAnalyses: new Map(
        Array.from(state.interviewNotesAnalyses.entries()).filter(([key]) => key !== id)
      ),
      hiringManagerEmails: new Map(
        Array.from(state.hiringManagerEmails.entries()).filter(([key]) => key !== id)
      ),
    })),

  clearCandidates: () =>
    set({
      candidates: [],
      analysisResults: null,
      interviewPreps: new Map(),
      postInterviewAnalyses: new Map(),
      interviewNotes: new Map(),
      interviewNotesAnalyses: new Map(),
      hiringManagerEmails: new Map(),
      selectedCandidateId: null,
    }),

  setAnalysisResults: (results) => set({ analysisResults: results }),

  // Interview Prep Actions
  setInterviewPrep: (candidateId, prep) =>
    set((state) => ({
      interviewPreps: new Map(state.interviewPreps).set(candidateId, prep),
    })),

  setPostInterviewAnalysis: (candidateId, analysis) =>
    set((state) => ({
      postInterviewAnalyses: new Map(state.postInterviewAnalyses).set(
        candidateId,
        analysis
      ),
    })),

  // Interview Notes Actions
  setInterviewNotes: (candidateId, notes) =>
    set((state) => ({
      interviewNotes: new Map(state.interviewNotes).set(candidateId, {
        candidateId,
        notes,
        analyzedAt: undefined,
      }),
    })),

  setInterviewNotesAnalysis: (candidateId, analysis) =>
    set((state) => ({
      interviewNotesAnalyses: new Map(state.interviewNotesAnalyses).set(
        candidateId,
        analysis
      ),
      interviewNotes: new Map(state.interviewNotes).set(candidateId, {
        ...state.interviewNotes.get(candidateId)!,
        analyzedAt: new Date(),
      }),
    })),

  setHiringManagerEmail: (candidateId, email) =>
    set((state) => ({
      hiringManagerEmails: new Map(state.hiringManagerEmails).set(
        candidateId,
        email
      ),
    })),

  // Chat Actions
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  updateChatMessage: (id, content) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  clearChat: () => set({ chatMessages: [] }),

  setSelectedCandidate: (id) => set({ selectedCandidateId: id }),

  // UI Actions
  setLoading: (loading, message = "") =>
    set({ isLoading: loading, loadingMessage: message }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Reset
  resetAll: () => set(initialState),
}));
