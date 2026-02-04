"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import type { RankingLevel } from "@/types";

export function JDMatchTable() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);
  const jobInfo = useAppStore((state) => state.jobInfo);

  if (!analysisResults?.jdMatches?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No JD match analysis available
      </div>
    );
  }

  // Helper to get stored candidate name (source of truth)
  const getCandidateName = (candidateId: string, fallbackName: string): string => {
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.name || fallbackName;
  };

  const tableTitle = jobInfo?.jobTitle 
    ? `Match Analysis: ${jobInfo.jobTitle}`
    : "Job Description Match Analysis";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {tableTitle}
      </h3>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-350px)] min-h-[300px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_theme(colors.gray.200)]">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Good Match to JD
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Gaps
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analysisResults.jdMatches.map((match) => {
                const displayName = getCandidateName(match.candidateId, match.name);
                return (
                <tr
                  key={match.candidateId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">
                      {displayName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {match.goodMatches.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {match.gaps.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <XCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={match.ranking as RankingLevel}>
                      {match.ranking.charAt(0).toUpperCase() +
                        match.ranking.slice(1)}
                    </Badge>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
