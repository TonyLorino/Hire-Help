"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { User, MapPin, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore, hasBeenAnimated, markAsAnimated } from "@/store/app-store";
import { AnimatedCard } from "@/components/ui/animated-card";
import { TypewriterText } from "@/components/ui/typewriter-text";
import type { RecommendationLevel, RankingLevel } from "@/types";

interface CandidateCardData {
  candidateId: string;
  name: string;
  location: string;
  summary: string;
  jdMatchPercent: number;
  recommendation: RecommendationLevel;
  rank: number;
  ranking: RankingLevel;
  goodMatches: string[];
  gaps: string[];
  experienceComparison: string;
}

export function AnalysisPage() {
  const analysisResults = useAppStore((state) => state.analysisResults);
  const candidates = useAppStore((state) => state.candidates);
  const jobInfo = useAppStore((state) => state.jobInfo);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const cardData = useMemo((): CandidateCardData[] => {
    if (!analysisResults) return [];

    const summaryMap = new Map(
      analysisResults.summaries?.map((s) => [s.candidateId, s]) || []
    );
    const jdMatchMap = new Map(
      analysisResults.jdMatches?.map((m) => [m.candidateId, m]) || []
    );
    const comparisonMap = new Map(
      analysisResults.comparisons?.map((c) => [c.candidateId, c]) || []
    );

    const candidateIds = new Set([
      ...(analysisResults.summaries?.map((s) => s.candidateId) || []),
      ...(analysisResults.jdMatches?.map((m) => m.candidateId) || []),
      ...(analysisResults.comparisons?.map((c) => c.candidateId) || []),
    ]);

    const data: CandidateCardData[] = [];

    candidateIds.forEach((id) => {
      const candidate = candidates.find((c) => c.id === id);
      const summary = summaryMap.get(id);
      const jdMatch = jdMatchMap.get(id);
      const comparison = comparisonMap.get(id);

      data.push({
        candidateId: id,
        name: candidate?.name || summary?.name || jdMatch?.name || comparison?.name || "Unknown",
        location: candidate?.location || summary?.location || "Unknown",
        summary: summary?.summary || comparison?.summary || "",
        jdMatchPercent: comparison?.jdMatchPercent || 0,
        recommendation: comparison?.recommendation || "consider",
        rank: comparison?.rank || 999,
        ranking: jdMatch?.ranking || "good",
        goodMatches: jdMatch?.goodMatches || [],
        gaps: jdMatch?.gaps || [],
        experienceComparison: comparison?.experienceComparison || "",
      });
    });

    return data.sort((a, b) => a.rank - b.rank);
  }, [analysisResults, candidates]);

  const tableKey = cardData.map((c) => c.candidateId).join("-");
  const skipAnimation = hasBeenAnimated(`analysis-${tableKey}`);

  useEffect(() => {
    if (cardData.length === 0) return;

    if (skipAnimation) {
      setVisibleCards(new Set(cardData.map((c) => c.candidateId)));
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    setVisibleCards(new Set());

    cardData.forEach((card, index) => {
      setTimeout(() => {
        setVisibleCards((prev) => new Set([...prev, card.candidateId]));
      }, index * 200);
    });

    const totalDelay = cardData.length * 200 + 500;
    setTimeout(() => {
      markAsAnimated(`analysis-${tableKey}`);
    }, totalDelay);
  }, [cardData, skipAnimation, tableKey]);

  if (!analysisResults || cardData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No analysis data available. Upload a job description and resumes to get started.
      </div>
    );
  }

  const getMatchColor = (percent: number): string => {
    if (percent >= 80) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (percent >= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  const getRecommendationStyle = (rec: RecommendationLevel) => {
    switch (rec) {
      case "concentrate":
        return { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-400", icon: TrendingUp, label: "Advance" };
      case "consider":
        return { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-400", icon: Minus, label: "Consider" };
      case "eliminate":
        return { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400", icon: TrendingDown, label: "Pass" };
    }
  };

  const pageTitle = jobInfo?.jobTitle
    ? `Candidate Analysis: ${jobInfo.jobTitle}`
    : "Candidate Analysis";

  return (
    <div className="p-6 space-y-6">
      <div className={`${skipAnimation ? "" : "animate-fade-in"}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {cardData.length} candidate{cardData.length !== 1 ? "s" : ""} analyzed and ranked
        </p>
      </div>

      <div className="space-y-4">
        {cardData.map((card, index) => {
          const isVisible = visibleCards.has(card.candidateId);
          const recStyle = getRecommendationStyle(card.recommendation);
          const RecIcon = recStyle.icon;
          const animationKey = `analysis-card-${card.candidateId}`;
          const skipCardAnim = skipAnimation || hasBeenAnimated(animationKey);

          return (
            <AnimatedCard
              key={card.candidateId}
              className={`overflow-hidden transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              delay={skipCardAnim ? 0 : index * 200}
              duration={400}
              skipAnimation={skipCardAnim}
              onAnimationComplete={() => markAsAnimated(animationKey)}
            >
              <CardContent className="p-0">
                {/* Card Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {card.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{card.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{card.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getMatchColor(
                        card.jdMatchPercent
                      )}`}
                    >
                      {card.jdMatchPercent}% JD Match
                    </div>
                    <Badge className={`${recStyle.bg} ${recStyle.text} border-0 gap-1`}>
                      <RecIcon className="h-3 w-3" />
                      {recStyle.label}
                    </Badge>
                  </div>
                </div>

                {/* Card Body - Three Columns */}
                <div className="grid grid-cols-12 divide-x divide-gray-100 dark:divide-gray-700">
                  {/* Summary Column - 50% */}
                  <div className="col-span-6 p-4">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Summary
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <TypewriterText
                        text={card.summary}
                        speed={skipCardAnim ? 0 : 80}
                        delay={skipCardAnim ? 0 : index * 200 + 300}
                        skipAnimation={skipCardAnim}
                      />
                    </div>
                    {card.experienceComparison && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          vs. Other Candidates
                        </h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <TypewriterText
                            text={card.experienceComparison}
                            speed={skipCardAnim ? 0 : 60}
                            delay={skipCardAnim ? 0 : index * 200 + 600}
                            skipAnimation={skipCardAnim}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Strengths Column - 25% */}
                  <div className="col-span-3 p-4 bg-green-50/30 dark:bg-green-900/10">
                    <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {card.goodMatches.slice(0, 5).map((match, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-green-500 dark:text-green-400 mt-1">•</span>
                          <span>{match}</span>
                        </li>
                      ))}
                      {card.goodMatches.length === 0 && (
                        <li className="text-sm text-gray-400 dark:text-gray-500 italic">
                          No specific matches identified
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Concerns Column - 25% */}
                  <div className="col-span-3 p-4 bg-red-50/30 dark:bg-red-900/10">
                    <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Concerns
                    </h4>
                    <ul className="space-y-1.5">
                      {card.gaps.slice(0, 5).map((gap, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-red-500 dark:text-red-400 mt-1">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                      {card.gaps.length === 0 && (
                        <li className="text-sm text-gray-400 dark:text-gray-500 italic">
                          No significant gaps identified
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
