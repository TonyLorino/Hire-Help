"use client";

import { User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function CandidateSelector() {
  const candidates = useAppStore((state) => state.candidates);
  const selectedCandidateId = useAppStore((state) => state.selectedCandidateId);
  const setSelectedCandidate = useAppStore((state) => state.setSelectedCandidate);

  if (candidates.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          Focus on:
        </span>
        <Button
          variant={selectedCandidateId === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCandidate(null)}
          className="text-xs h-7"
        >
          All Candidates
        </Button>
        {candidates.map((candidate) => (
          <Button
            key={candidate.id}
            variant={selectedCandidateId === candidate.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCandidate(candidate.id)}
            className={cn(
              "text-xs h-7 flex-shrink-0",
              selectedCandidateId === candidate.id && "pr-2"
            )}
          >
            <User className="h-3 w-3 mr-1" />
            {candidate.name}
            {selectedCandidateId === candidate.id && (
              <Check className="h-3 w-3 ml-1" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
