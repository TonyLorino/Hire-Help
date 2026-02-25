"use client";

import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateSummary } from "@/components/analysis/CandidateSummary";
import { JDMatchTable } from "@/components/analysis/JDMatchTable";
import { CandidateCompareTable } from "@/components/analysis/CandidateCompareTable";
import { InterviewPrepView } from "@/components/interview/InterviewPrepView";
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
        <div className="text-center max-w-md">
          {/* Step indicator */}
          <div className="mb-6">
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Step 1 of 3
            </span>
          </div>

          {/* Arrow pointing to left panel */}
          <div className="flex items-center justify-center gap-2 mb-6 animate-point-left">
            <ArrowLeft className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary font-medium">Upload in the left panel</span>
          </div>

          {/* Icon */}
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Welcome to Hire Help
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your AI-powered hiring assistant. Start by uploading a job description, 
            then add candidate resumes to get instant analysis and recommendations.
          </p>

          {/* Quick workflow overview */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6">
            <span className="font-medium text-primary">Upload JD</span>
            <ChevronRight className="h-3 w-3" />
            <span>Add Resumes</span>
            <ChevronRight className="h-3 w-3" />
            <span>Get Analysis</span>
          </div>
        </div>
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
            <div className="text-center py-12 max-w-md mx-auto">
              {/* Step indicator */}
              <div className="mb-6">
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Step 2 of 3
                </span>
              </div>

              {/* Arrow pointing to resume upload */}
              <div className="flex items-center justify-center gap-2 mb-6 animate-point-left">
                <ArrowLeft className="h-5 w-5 text-primary" />
                <span className="text-sm text-primary font-medium">Add resumes below</span>
              </div>

              {/* Icon */}
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10 text-success mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job Description Loaded
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Great! Now upload candidate resumes to begin analysis. You can also 
                click &ldquo;Recommend Updates&rdquo; in the JD preview to get AI suggestions for 
                improving your job description.
              </p>

              {/* Next step hint */}
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                <strong className="text-gray-700">Next:</strong> Upload one or more resumes (PDF, Word, or text) 
                to see how candidates match your job requirements.
              </div>
            </div>
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
          {activeTab === "recommendations" && <RecommendationsView />}
        </div>
      </div>
    </div>
  );
}
