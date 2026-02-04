"use client";

import { Separator } from "@/components/ui/separator";
import { JDUpload } from "@/components/job-description/JDUpload";
import { JDPreview } from "@/components/job-description/JDPreview";
import { ResumeUpload } from "@/components/resumes/ResumeUpload";
import { ResumeList } from "@/components/resumes/ResumeList";
import { useAppStore } from "@/store/app-store";

export function LeftPanel() {
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);

  return (
    <div className="h-full w-full border-r border-gray-200 bg-white overflow-hidden">
      <div className="h-full w-full overflow-y-auto overflow-x-hidden">
        <div className="p-6 space-y-6 w-full max-w-full box-border">
          {/* Job Description Section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Job Description
            </h2>
            {jobDescription ? <JDPreview /> : <JDUpload />}
          </section>

          <Separator />

          {/* Resume Upload Section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Candidate Resumes
            </h2>
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
