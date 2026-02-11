"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore, hasBeenAnimated, markAsAnimated } from "@/store/app-store";
import { TypewriterText } from "@/components/ui/typewriter-text";
import type { RecommendationLevel } from "@/types";

export function CandidateCompareTable() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Sort by rank - memoized to prevent unnecessary recalculations
  const sortedComparisons = useMemo(() => {
    return analysisResults?.comparisons
      ? [...analysisResults.comparisons].sort((a, b) => a.rank - b.rank)
      : [];
  }, [analysisResults?.comparisons]);

  // Check if this table has already been animated
  const tableKey = sortedComparisons.map(c => c.candidateId).join('-');
  const skipAnimation = hasBeenAnimated(`compare-${tableKey}`);

  // Initialize visibility and handle animation
  useEffect(() => {
    if (sortedComparisons.length === 0) return;
    
    // If already animated, show all immediately
    if (skipAnimation) {
      setVisibleRows(new Set(sortedComparisons.map(c => c.candidateId)));
      return;
    }
    
    // Prevent re-animation on re-renders within the same session
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    setVisibleRows(new Set());
    
    // Stagger row visibility
    sortedComparisons.forEach((comparison, index) => {
      setTimeout(() => {
        setVisibleRows(prev => new Set([...prev, comparison.candidateId]));
      }, index * 200);
    });
    
    // Mark as animated after all rows are visible
    const totalDelay = sortedComparisons.length * 200 + 500;
    setTimeout(() => {
      markAsAnimated(`compare-${tableKey}`);
    }, totalDelay);
  }, [analysisResults?.comparisons, skipAnimation, tableKey, sortedComparisons]);

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

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold text-gray-900 ${skipAnimation ? '' : 'animate-fade-in'}`}>
        Candidate vs Candidate Comparison
      </h3>

      {/* Table with animation */}
      <Card className={`overflow-hidden ${skipAnimation ? '' : 'animate-scale-in'}`}>
        <div className="max-h-[calc(100vh-350px)] min-h-[300px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_theme(colors.gray.200)]">
              <tr className="border-b border-gray-200">
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
              {sortedComparisons.map((comparison, rowIndex) => {
                const displayName = getCandidateName(comparison.candidateId, comparison.name);
                const isVisible = visibleRows.has(comparison.candidateId);
                
                return (
                <tr
                  key={comparison.candidateId}
                  className={`hover:bg-gray-50 ${skipAnimation ? '' : 'transition-all duration-300'} ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold mx-auto ${skipAnimation ? '' : 'transition-all duration-300'} ${
                      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`} style={{ transitionDelay: skipAnimation ? "0ms" : (isVisible ? "100ms" : "0ms") }}>
                      {comparison.rank}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">
                      {displayName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      <TypewriterText
                        text={comparison.summary}
                        speed={120}
                        delay={skipAnimation ? 0 : rowIndex * 200 + 300}
                        skipAnimation={skipAnimation}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      <TypewriterText
                        text={comparison.experienceComparison}
                        speed={120}
                        delay={skipAnimation ? 0 : rowIndex * 200 + 500}
                        skipAnimation={skipAnimation}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex items-center justify-center ${skipAnimation ? '' : 'transition-all duration-500'} ${
                      isVisible ? "opacity-100" : "opacity-0"
                    }`} style={{ transitionDelay: skipAnimation ? "0ms" : (isVisible ? "400ms" : "0ms") }}>
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
                            strokeDasharray={isVisible || skipAnimation ? `${comparison.jdMatchPercent * 1.256} 125.6` : "0 125.6"}
                            className={`text-primary ${skipAnimation ? '' : 'transition-all duration-1000'}`}
                            style={{ transitionDelay: skipAnimation ? "0ms" : (isVisible ? `${rowIndex * 200 + 500}ms` : "0ms") }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {comparison.jdMatchPercent}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`${skipAnimation ? '' : 'transition-all duration-300'} ${
                      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`} style={{ transitionDelay: skipAnimation ? "0ms" : (isVisible ? "500ms" : "0ms") }}>
                      <Badge
                        variant={comparison.recommendation as RecommendationLevel}
                      >
                        {comparison.recommendation.charAt(0).toUpperCase() +
                          comparison.recommendation.slice(1)}
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

      {/* Legend with staggered animation */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className={`flex items-center gap-2 ${skipAnimation ? '' : 'animate-fade-in-up stagger-1'}`}>
          <Badge variant="concentrate">Concentrate</Badge>
          <span>Start with this candidate</span>
        </div>
        <div className={`flex items-center gap-2 ${skipAnimation ? '' : 'animate-fade-in-up stagger-2'}`}>
          <Badge variant="consider">Consider</Badge>
          <span>Worth evaluating</span>
        </div>
        <div className={`flex items-center gap-2 ${skipAnimation ? '' : 'animate-fade-in-up stagger-3'}`}>
          <Badge variant="eliminate">Eliminate</Badge>
          <span>Can be removed</span>
        </div>
      </div>
    </div>
  );
}
