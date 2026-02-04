"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import type { RecommendationLevel } from "@/types";

export function CandidateCompareTable() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);

  if (!analysisResults?.comparisons?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No candidate comparison available
      </div>
    );
  }

  // Helper to get stored candidate name (source of truth)
  const getCandidateName = (candidateId: string, fallbackName: string): string => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.name || fallbackName;
  };

  // Sort by rank
  const sortedComparisons = [...analysisResults.comparisons].sort(
    (a, b) => a.rank - b.rank
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Candidate vs Candidate Comparison
      </h3>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Experience vs Others
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  JD Match
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedComparisons.map((comparison) => {
                const displayName = getCandidateName(comparison.candidateId, comparison.name);
                return (
                <tr
                  key={comparison.candidateId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold mx-auto">
                      {comparison.rank}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">
                      {displayName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {comparison.summary}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {comparison.experienceComparison}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${comparison.jdMatchPercent * 1.256} 125.6`}
                            className="text-primary"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {comparison.jdMatchPercent}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge
                      variant={comparison.recommendation as RecommendationLevel}
                    >
                      {comparison.recommendation.charAt(0).toUpperCase() +
                        comparison.recommendation.slice(1)}
                    </Badge>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Badge variant="concentrate">Concentrate</Badge>
          <span>Start with this candidate</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="consider">Consider</Badge>
          <span>Worth evaluating</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="eliminate">Eliminate</Badge>
          <span>Can be removed</span>
        </div>
      </div>
    </div>
  );
}
