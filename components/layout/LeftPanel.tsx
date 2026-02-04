"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
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
      </ScrollArea>
    </div>
  );
}
