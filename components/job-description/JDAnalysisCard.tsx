"use client";

import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function JDAnalysisCard() {
  const jdAnalysis = useAppStore((state) => state.jdAnalysis);

  if (!jdAnalysis) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{jdAnalysis.overview}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-success">
              <CheckCircle2 className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jdAnalysis.strengths.map((strength, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-success mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-warning">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {jdAnalysis.improvements.map((improvement, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-warning mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Updates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-primary">
            <Lightbulb className="h-5 w-5" />
            Suggested Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {jdAnalysis.suggestedUpdates.map((update, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-600 p-3 bg-primary-50 rounded-lg"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-medium">
                  {i + 1}
                </span>
                {update}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
