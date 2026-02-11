"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { TypewriterText } from "@/components/ui/typewriter-text";
import type { RankingLevel } from "@/types";

export function JDMatchTable() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);
  const jobInfo = useAppStore((state) => state.jobInfo);
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);

  // Reset animation when results change
  useEffect(() => {
    if (analysisResults?.jdMatches) {
      setVisibleRows(new Set());
      setAnimationKey(prev => prev + 1);
      
      // Stagger row visibility
      analysisResults.jdMatches.forEach((match, index) => {
        setTimeout(() => {
          setVisibleRows(prev => new Set([...prev, match.candidateId]));
        }, index * 150);
      });
    }
  }, [analysisResults?.jdMatches]);

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
      <h3 className="text-lg font-semibold text-gray-900 animate-fade-in">
        {tableTitle}
      </h3>

      {/* Table with draw animation */}
      <Card className="overflow-hidden animate-scale-in">
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
              {analysisResults.jdMatches.map((match, rowIndex) => {
                const displayName = getCandidateName(match.candidateId, match.name);
                const isVisible = visibleRows.has(match.candidateId);
                
                return (
                <tr
                  key={`${match.candidateId}-${animationKey}`}
                  className={`hover:bg-gray-50 transition-all duration-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
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
                          className={`flex items-start gap-2 text-sm text-gray-600 transition-opacity duration-200 ${
                            isVisible ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ transitionDelay: isVisible ? `${i * 50}ms` : "0ms" }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          {isVisible ? (
                            <TypewriterText
                              text={item}
                              speed={150}
                              delay={rowIndex * 150 + i * 100 + 200}
                            />
                          ) : (
                            <span>{item}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {match.gaps.map((item, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm text-gray-600 transition-opacity duration-200 ${
                            isVisible ? "opacity-100" : "opacity-0"
                          }`}
                          style={{ transitionDelay: isVisible ? `${i * 50}ms` : "0ms" }}
                        >
                          <XCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                          {isVisible ? (
                            <TypewriterText
                              text={item}
                              speed={150}
                              delay={rowIndex * 150 + i * 100 + 200}
                            />
                          ) : (
                            <span>{item}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`transition-all duration-300 ${
                      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`} style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}>
                      <Badge variant={match.ranking as RankingLevel}>
                        {match.ranking.charAt(0).toUpperCase() +
                          match.ranking.slice(1)}
                      </Badge>
                    </div>
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
