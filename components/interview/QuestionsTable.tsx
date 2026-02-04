"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="overflow-hidden">
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
              groupedQuestions[category]?.map((question, index) => (
                <tr
                  key={question.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {question.question}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {question.reason}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {question.whatToLookFor}
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-h-[60px] border border-dashed border-gray-200 rounded-lg p-2 text-sm text-gray-400">
                      <span className="opacity-50">Space for notes...</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[category]}`}
                    >
                      {categoryLabels[category]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
