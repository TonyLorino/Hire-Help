"use client";

import { Trash2, FileText, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "@/store/app-store";
import { useState } from "react";

export function ResumeList() {
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const candidates = useAppStore((state) => state.candidates);
  const removeCandidate = useAppStore((state) => state.removeCandidate);
  const clearCandidates = useAppStore((state) => state.clearCandidates);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const setAnalysisResults = useAppStore((state) => state.setAnalysisResults);

  const handleReanalyze = async () => {
    if (!jobDescription || candidates.length === 0) return;
    
    setIsReanalyzing(true);
    try {
      const response = await fetch("/api/analyze-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumes: candidates.map((c) => ({
            id: c.id,
            name: c.name,
            text: c.resumeText,
          })),
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error("Re-analysis error:", error);
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <div className="space-y-3 w-full min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReanalyze}
            disabled={isReanalyzing || candidates.length === 0}
            className="text-xs"
          >
            {isReanalyzing ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Re-analyze
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCandidates}
            className="text-xs text-gray-400 hover:text-danger"
          >
            Clear All
          </Button>
        </div>
      </div>

      {candidates.map((candidate) => (
        <Card key={candidate.id} className="hover-lift w-full min-w-0 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {candidate.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{candidate.location}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {candidate.fileName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCandidate(candidate.id)}
                className="h-8 w-8 text-gray-400 hover:text-danger flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
