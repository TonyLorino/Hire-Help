"use client";

import { User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function CandidateSummary() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);

  if (!analysisResults?.summaries?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No candidate summaries available
      </div>
    );
  }

  // Helper to get stored candidate name (source of truth)
  const getCandidateName = (candidateId: string, fallbackName: string): string => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.name || fallbackName;
  };

  // Helper to get stored candidate location
  const getCandidateLocation = (candidateId: string, fallbackLocation: string): string => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.location || fallbackLocation;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Candidate Summaries
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {analysisResults.summaries.map((summary) => {
          const displayName = getCandidateName(summary.candidateId, summary.name);
          const displayLocation = getCandidateLocation(summary.candidateId, summary.location);
          
          return (
            <Card key={summary.candidateId} className="hover-lift animate-fade-in">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {displayName}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {displayLocation}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
