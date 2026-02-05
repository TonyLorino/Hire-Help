"use client";

import Image from "next/image";
import { RotateCcw, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function Header() {
  const resetAll = useAppStore((state) => state.resetAll);
  const jobInfo = useAppStore((state) => state.jobInfo);
  const jobDescription = useAppStore((state) => state.jobDescription);

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
      <div className="mx-auto max-w-[1800px] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hire Help"
              width={40}
              height={40}
              className="rounded-apple"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Hire Help
              </h1>
              {jobInfo?.jobTitle ? (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {jobInfo.jobTitle}
                  {jobInfo.company && ` at ${jobInfo.company}`}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {jobDescription ? "Job Description Loaded" : "AI-Powered Hiring Assistant"}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
