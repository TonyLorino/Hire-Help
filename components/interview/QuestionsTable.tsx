"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TypewriterText } from "@/components/ui/typewriter-text";
import type { InterviewQuestion } from "@/types";

interface QuestionsTableProps {
  questions: InterviewQuestion[];
  candidateId?: string;
  isNewData?: boolean; // Whether this is freshly generated data that should animate
}

const categoryLabels: Record<InterviewQuestion["category"], string> = {
  icebreaker: "Ice Breaker",
  "jd-specific": "JD Specific",
  "candidate-specific": "Candidate Specific",
};

const categoryColors: Record<InterviewQuestion["category"], string> = {
  icebreaker: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  "jd-specific": "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  "candidate-specific": "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};

const orderedCategories: InterviewQuestion["category"][] = [
  "icebreaker",
  "jd-specific",
  "candidate-specific",
];

export function QuestionsTable({ questions, candidateId, isNewData = false }: QuestionsTableProps) {
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const initializedRef = useRef<string | null>(null);

  // Group questions by category - memoized
  const groupedQuestions = useMemo(() => {
    return questions.reduce(
      (acc, q) => {
        if (!acc[q.category]) acc[q.category] = [];
        acc[q.category].push(q);
        return acc;
      },
      {} as Record<InterviewQuestion["category"], InterviewQuestion[]>
    );
  }, [questions]);

  // Flatten questions in order for animation - memoized
  const flatQuestions = useMemo(() => {
    return orderedCategories.flatMap(
      (cat) => groupedQuestions[cat] || []
    );
  }, [groupedQuestions]);

  // Only animate if this is new data that hasn't been animated before
  const shouldAnimate = isNewData && initializedRef.current !== candidateId;

  // Reset and stagger row visibility when questions change
  useEffect(() => {
    if (!shouldAnimate) {
      // Show all immediately
      setVisibleRows(new Set(flatQuestions.map(q => q.id)));
      return;
    }
    
    // Mark as initialized for this candidate
    initializedRef.current = candidateId || null;
    
    setVisibleRows(new Set());
    
    const timers: NodeJS.Timeout[] = [];
    flatQuestions.forEach((q, index) => {
      const timer = setTimeout(() => {
        setVisibleRows(prev => new Set([...prev, q.id]));
      }, index * 120);
      timers.push(timer);
    });
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [questions, candidateId, shouldAnimate, flatQuestions]);

  return (
    <Card className={`overflow-hidden ${shouldAnimate ? 'animate-scale-in' : ''}`}>
      <div className="min-h-[300px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[0_1px_0_0_theme(colors.gray.200)] dark:shadow-[0_1px_0_0_theme(colors.gray.700)]">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[10%]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[35%]">
                Question
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[25%]">
                Why Ask This
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[30%]">
                What to Look For
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {orderedCategories.map((category) =>
              groupedQuestions[category]?.map((question) => {
                const isVisible = visibleRows.has(question.id);
                const globalIndex = flatQuestions.findIndex(q => q.id === question.id);
                
                return (
                  <tr
                    key={question.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${shouldAnimate ? 'transition-all duration-300' : ''} ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${shouldAnimate ? 'transition-all duration-300' : ''} ${categoryColors[category]} ${
                          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                        style={{ transitionDelay: shouldAnimate && isVisible ? "200ms" : "0ms" }}
                      >
                        {categoryLabels[category]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <TypewriterText
                        text={question.question}
                        speed={100}
                        delay={shouldAnimate ? globalIndex * 120 + 100 : 0}
                        skipAnimation={!shouldAnimate}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <TypewriterText
                        text={question.reason}
                        speed={120}
                        delay={shouldAnimate ? globalIndex * 120 + 300 : 0}
                        skipAnimation={!shouldAnimate}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <TypewriterText
                        text={question.whatToLookFor}
                        speed={120}
                        delay={shouldAnimate ? globalIndex * 120 + 500 : 0}
                        skipAnimation={!shouldAnimate}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
