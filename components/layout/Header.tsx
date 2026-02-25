"use client";

import Image from "next/image";
import { RotateCcw, Briefcase, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useTheme } from "@/components/theme-provider";

export function Header() {
  const resetAll = useAppStore((state) => state.resetAll);
  const jobInfo = useAppStore((state) => state.jobInfo);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 dark:backdrop-blur-xl">
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
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Hire Help
              </h1>
              {jobInfo?.jobTitle ? (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {jobInfo.jobTitle}
                  {jobInfo.company && ` at ${jobInfo.company}`}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
              className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
