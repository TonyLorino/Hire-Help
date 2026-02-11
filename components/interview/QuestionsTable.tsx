"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TypewriterText } from "@/components/ui/typewriter-text";
import type { InterviewQuestion } from "@/types";

interface QuestionsTableProps {
  questions: InterviewQuestion[];
}

const categoryLabels: Record<InterviewQuestion["category"], string> = {
  icebreaker: "Ice Breaker",
  "jd-specific": "JD Specific",
  "candidate-specific": "Candidate Specific",
};

const categoryColors: Record<InterviewQuestion["category"], string> = {
  icebreaker: "bg-blue-50 text-blue-700",
  "jd-specific": "bg-purple-50 text-purple-700",
  "candidate-specific": "bg-orange-50 text-orange-700",
};

export function QuestionsTable({ questions }: QuestionsTableProps) {
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);

  // Group questions by category
  const groupedQuestions = questions.reduce(
    (acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    },
    {} as Record<InterviewQuestion["category"], InterviewQuestion[]>
  );

  const orderedCategories: InterviewQuestion["category"][] = [
    "icebreaker",
    "jd-specific",
    "candidate-specific",
  ];

  // Flatten questions in order for animation
  const flatQuestions = orderedCategories.flatMap(
    (cat) => groupedQuestions[cat] || []
  );

  // Reset and stagger row visibility when questions change
  useEffect(() => {
    setVisibleRows(new Set());
    setAnimationKey(prev => prev + 1);
    
    flatQuestions.forEach((q, index) => {
      setTimeout(() => {
        setVisibleRows(prev => new Set([...prev, q.id]));
      }, index * 120);
    });
  }, [questions]);

  return (
    <Card className="overflow-hidden animate-scale-in">
      <div className="max-h-[calc(100vh-350px)] min-h-[300px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_theme(colors.gray.200)]">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                Question
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                Why Ask This
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                What to Look For
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[5%]">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orderedCategories.map((category) =>
              groupedQuestions[category]?.map((question, index) => {
                const isVisible = visibleRows.has(question.id);
                const globalIndex = flatQuestions.findIndex(q => q.id === question.id);
                
                return (
                  <tr
                    key={`${question.id}-${animationKey}`}
                    className={`hover:bg-gray-50 transition-all duration-300 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {isVisible ? (
                        <TypewriterText
                          text={question.question}
                          speed={100}
                          delay={globalIndex * 120 + 100}
                        />
                      ) : (
                        question.question
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {isVisible ? (
                        <TypewriterText
                          text={question.reason}
                          speed={120}
                          delay={globalIndex * 120 + 300}
                        />
                      ) : (
                        question.reason
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {isVisible ? (
                        <TypewriterText
                          text={question.whatToLookFor}
                          speed={120}
                          delay={globalIndex * 120 + 500}
                        />
                      ) : (
                        question.whatToLookFor
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`min-h-[60px] border border-dashed border-gray-200 rounded-lg p-2 text-sm text-gray-400 transition-opacity duration-300 ${
                        isVisible ? "opacity-100" : "opacity-0"
                      }`} style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}>
                        <span className="opacity-50">Space for notes...</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${categoryColors[category]} ${
                          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                        style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
                      >
                        {categoryLabels[category]}
                      </span>
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
