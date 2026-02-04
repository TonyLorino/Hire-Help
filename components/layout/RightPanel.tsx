"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateSummary } from "@/components/analysis/CandidateSummary";
import { JDMatchTable } from "@/components/analysis/JDMatchTable";
import { CandidateCompareTable } from "@/components/analysis/CandidateCompareTable";
import { InterviewPrepView } from "@/components/interview/InterviewPrepView";
import { InterviewNotesView } from "@/components/interview/InterviewNotesView";
import { RecommendationsView } from "@/components/recommendations/RecommendationsView";
import { JDAnalysisCard } from "@/components/job-description/JDAnalysisCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { useAppStore } from "@/store/app-store";
import type { ActiveTab } from "@/types";

export function RightPanel() {
  const jobDescription = useAppStore((state) => state.jobDescription);
  const jdAnalysis = useAppStore((state) => state.jdAnalysis);
  const candidates = useAppStore((state) => state.candidates);
  const analysisResults = useAppStore((state) => state.analysisResults);
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  // Show empty state if no JD
  if (!jobDescription) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/50 p-8">
        <EmptyState
          title="Get Started"
          description="Upload a job description to begin analyzing candidates"
          icon="file-text"
        />
      </div>
    );
  }

  // Show JD analysis if no candidates yet
  if (candidates.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          {jdAnalysis ? (
            <JDAnalysisCard />
          ) : (
            <EmptyState
              title="Job Description Loaded"
              description="Click 'Recommend Updates' to analyze the job description, or upload resumes to begin candidate analysis"
              icon="search"
            />
          )}
        </div>
      </div>
    );
  }

  // Show analysis tabs if we have candidates
  return (
    <div className="flex h-full flex-col bg-gray-50/50 overflow-hidden">
      {/* Tab bar - fixed, never shrinks or gets covered */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 overflow-x-auto z-20">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
          <TabsList className="w-full justify-start min-w-max">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="jd-match">JD Match</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="interview">Interview Prep</TabsTrigger>
            <TabsTrigger value="notes">Interview Notes</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="p-6">
          {activeTab === "summary" && (
            analysisResults ? (
              <CandidateSummary />
            ) : (
              <EmptyState
                title="Analysis Pending"
                description="Analysis will appear here after processing candidates"
                icon="loader"
              />
            )
          )}
          {activeTab === "jd-match" && (
            analysisResults ? (
              <JDMatchTable />
            ) : (
              <EmptyState
                title="Analysis Pending"
                description="JD match analysis will appear here"
                icon="loader"
              />
            )
          )}
          {activeTab === "comparison" && (
            analysisResults ? (
              <CandidateCompareTable />
            ) : (
              <EmptyState
                title="Analysis Pending"
                description="Candidate comparison will appear here"
                icon="loader"
              />
            )
          )}
          {activeTab === "interview" && <InterviewPrepView />}
          {activeTab === "notes" && <InterviewNotesView />}
          {activeTab === "recommendations" && <RecommendationsView />}
        </div>
      </div>
    </div>
  );
}
