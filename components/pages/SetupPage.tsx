"use client";

import { Check, FileText, Users } from "lucide-react";
import { JDUpload } from "@/components/job-description/JDUpload";
import { JDPreview } from "@/components/job-description/JDPreview";
import { ResumeUpload } from "@/components/resumes/ResumeUpload";
import { ResumeList } from "@/components/resumes/ResumeList";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

function ProgressIndicator({ step, currentStep }: { step: number; currentStep: number }) {
  const isComplete = currentStep > step;
  const isCurrent = currentStep === step;

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300",
        isComplete
          ? "bg-primary text-white"
          : isCurrent
          ? "bg-primary/10 text-primary ring-2 ring-primary/30"
          : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
      )}
    >
      {isComplete ? <Check className="h-4 w-4" /> : step}
    </div>
  );
}

export function SetupPage() {
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);
  const analysisResults = useAppStore((state) => state.analysisResults);

  const currentStep = analysisResults
    ? 4
    : candidates.length > 0
    ? 3
    : jobDescription
    ? 2
    : 1;

  return (
    <div className="flex flex-col h-full bg-gray-50/30 dark:bg-gray-900/30">
      {/* Header with Progress */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Setup Your Hiring Analysis
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Upload a job description and candidate resumes to get AI-powered analysis and recommendations.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <ProgressIndicator step={1} currentStep={currentStep} />
              <span className={cn("text-sm font-medium", currentStep >= 1 ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}>
                Job Description
              </span>
            </div>
            <div className={cn("w-12 h-0.5", currentStep > 1 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700")} />
            <div className="flex items-center gap-3">
              <ProgressIndicator step={2} currentStep={currentStep} />
              <span className={cn("text-sm font-medium", currentStep >= 2 ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}>
                Resumes
              </span>
            </div>
            <div className={cn("w-12 h-0.5", currentStep > 2 ? "bg-primary" : "bg-gray-200 dark:bg-gray-700")} />
            <div className="flex items-center gap-3">
              <ProgressIndicator step={3} currentStep={currentStep} />
              <span className={cn("text-sm font-medium", currentStep >= 3 ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500")}>
                Analysis Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full max-w-6xl mx-auto">
          {/* Left Side - Job Description */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  jobDescription ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                )}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Description</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {jobDescription ? "Loaded and ready" : "Upload to get started"}
                  </p>
                </div>
              </div>

              {jobDescription ? <JDPreview /> : <JDUpload />}
            </div>
          </div>

          {/* Right Side - Resumes */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  candidates.length > 0 ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                )}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Candidate Resumes</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {candidates.length > 0
                      ? `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} loaded`
                      : jobDescription
                      ? "Upload resumes to analyze"
                      : "Upload a job description first"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <ResumeUpload />
                {candidates.length > 0 && <ResumeList />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
