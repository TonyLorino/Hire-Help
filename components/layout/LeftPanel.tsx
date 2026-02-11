"use client";

import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { JDUpload } from "@/components/job-description/JDUpload";
import { JDPreview } from "@/components/job-description/JDPreview";
import { ResumeUpload } from "@/components/resumes/ResumeUpload";
import { ResumeList } from "@/components/resumes/ResumeList";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

// Progress indicator component
function ProgressSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: "Job Description", step: 1 },
    { label: "Resumes", step: 2 },
    { label: "Analysis", step: 3 },
  ];

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((item, index) => (
        <div key={item.step} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
                currentStep > item.step
                  ? "bg-primary text-white"
                  : currentStep === item.step
                  ? "bg-primary/10 text-primary ring-2 ring-primary/30"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {currentStep > item.step ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                item.step
              )}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 font-medium",
                currentStep >= item.step ? "text-gray-700" : "text-gray-400"
              )}
            >
              {item.label}
            </span>
          </div>
          
          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 mx-2 transition-colors duration-300",
                currentStep > item.step ? "bg-primary" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function LeftPanel() {
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);
  const analysisResults = useAppStore((state) => state.analysisResults);

  // Determine current step
  const currentStep = analysisResults 
    ? 3 
    : candidates.length > 0 
    ? 2 
    : jobDescription 
    ? 2 
    : 1;

  return (
    <div className="h-full w-full border-r border-gray-200 bg-white overflow-hidden">
      <div className="h-full w-full overflow-y-auto overflow-x-hidden">
        <div className="p-6 space-y-6 w-full max-w-full box-border">
          {/* Progress indicator */}
          <ProgressSteps currentStep={currentStep} />

          {/* Job Description Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Job Description
              </h2>
              {!jobDescription && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">
                  Start here
                </span>
              )}
            </div>
            {jobDescription ? <JDPreview /> : <JDUpload />}
          </section>

          <Separator />

          {/* Resume Upload Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Candidate Resumes
              </h2>
              {jobDescription && candidates.length === 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">
                  Next step
                </span>
              )}
            </div>
            <ResumeUpload />
            {candidates.length > 0 && (
              <div className="mt-4">
                <ResumeList />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
