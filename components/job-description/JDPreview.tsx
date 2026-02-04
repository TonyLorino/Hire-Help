"use client";

import { useState } from "react";
import { Sparkles, Trash2, ChevronDown, ChevronUp, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "@/store/app-store";
import { truncateText } from "@/lib/utils";

export function JDPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const jobDescription = useAppStore((state) => state.jobDescription);
  const jobInfo = useAppStore((state) => state.jobInfo);
  const jdAnalysis = useAppStore((state) => state.jdAnalysis);
  const clearJobDescription = useAppStore((state) => state.clearJobDescription);
  const setJDAnalysis = useAppStore((state) => state.setJDAnalysis);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      
      if (!response.ok) throw new Error("Analysis failed");
      
      const analysis = await response.json();
      setJDAnalysis(analysis);
    } catch (error) {
      console.error("Failed to analyze JD:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayText = isExpanded
    ? jobDescription
    : truncateText(jobDescription, 300);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {jobInfo?.jobTitle || "Job Description"}
            </CardTitle>
            {(jobInfo?.company || jobInfo?.location) && (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {jobInfo.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {jobInfo.company}
                  </span>
                )}
                {jobInfo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {jobInfo.location}
                  </span>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearJobDescription}
            className="text-gray-400 hover:text-danger flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* JD Text Preview */}
        <div className="relative">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {displayText}
          </p>
          {jobDescription.length > 300 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-600 mt-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show more
                </>
              )}
            </button>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          variant={jdAnalysis ? "outline" : "default"}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {jdAnalysis ? "Re-analyze" : "Recommend JD Updates"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
