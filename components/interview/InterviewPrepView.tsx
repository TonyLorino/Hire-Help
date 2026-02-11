"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore, hasBeenAnimated, markAsAnimated } from "@/store/app-store";
import { QuestionsTable } from "./QuestionsTable";
import { AnimatedCard, AnimatedCardSkeleton } from "@/components/ui/animated-card";
import { TypewriterParagraph } from "@/components/ui/typewriter-text";

export function InterviewPrepView() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [justGenerated, setJustGenerated] = useState<string | null>(null);

  const candidates = useAppStore((state) => state.candidates);
  const interviewPreps = useAppStore((state) => state.interviewPreps);
  const setInterviewPrep = useAppStore((state) => state.setInterviewPrep);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const analysisResults = useAppStore((state) => state.analysisResults);

  const generatePrep = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    setIsLoading(true);
    setSelectedCandidateId(candidateId);
    setJustGenerated(null);

    try {
      const jdMatch = analysisResults?.jdMatches?.find(
        (m) => m.candidateId === candidateId || m.name === candidate.name
      );

      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          candidateId,
          candidateName: candidate.name,
          resumeText: candidate.resumeText,
          matchInfo: jdMatch
            ? { matches: jdMatch.goodMatches, gaps: jdMatch.gaps }
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate prep");

      const prep = await response.json();
      setInterviewPrep(candidateId, prep);
      setJustGenerated(candidateId); // Mark as just generated to trigger animation
    } catch (error) {
      console.error("Interview prep error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!selectedCandidateId) return;
    const prep = interviewPreps.get(selectedCandidateId);
    if (!prep) return;

    try {
      if (format === "pdf") {
        // Open print dialog for PDF
        const response = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prep, format: "pdf" }),
        });

        if (!response.ok) throw new Error("Export failed");

        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 250);
        }
      } else {
        // Download DOCX
        const response = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prep, format }),
        });

        if (!response.ok) throw new Error("Export failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `interview-prep-${prep.candidateName.replace(/\s+/g, "-")}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const currentPrep = selectedCandidateId
    ? interviewPreps.get(selectedCandidateId)
    : null;

  // Determine if we should animate - only animate if just generated
  const animationKey = selectedCandidateId ? `prep-${selectedCandidateId}` : '';
  const shouldAnimate = justGenerated === selectedCandidateId && !hasBeenAnimated(animationKey);

  // Mark as animated after showing
  useEffect(() => {
    if (currentPrep && selectedCandidateId && shouldAnimate) {
      const timer = setTimeout(() => {
        markAsAnimated(animationKey);
        setJustGenerated(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPrep, selectedCandidateId, shouldAnimate, animationKey]);

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Upload candidates to generate interview prep materials
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Interview Preparation
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Select a candidate below to generate personalized interview questions and talking points
        </p>
      </div>

      {/* Candidate Selection */}
      <div className="space-y-2">
        {!selectedCandidateId && (
          <p className="text-xs text-primary flex items-center gap-1.5 animate-subtle-bounce">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
            Click a candidate name to begin
          </p>
        )}
        <div className="flex flex-wrap gap-2">
        {candidates.map((candidate) => {
          const hasPrep = interviewPreps.has(candidate.id);
          return (
            <Button
              key={candidate.id}
              variant={selectedCandidateId === candidate.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCandidateId(candidate.id);
                if (!hasPrep) {
                  generatePrep(candidate.id);
                }
              }}
              disabled={isLoading && selectedCandidateId === candidate.id}
            >
              {isLoading && selectedCandidateId === candidate.id ? (
                <Spinner size="sm" className="mr-2" />
              ) : hasPrep ? (
                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              {candidate.name}
            </Button>
          );
        })}
        </div>
      </div>

      {/* Interview Prep Content */}
      {currentPrep && (
        <div className="space-y-6">
          {/* Export Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("docx")}>
              <FileText className="h-4 w-4 mr-2" />
              Export Word
            </Button>
          </div>

          {/* Summary Card with animation */}
          <AnimatedCard delay={0} duration={500} skipAnimation={!shouldAnimate}>
            <CardHeader>
              <CardTitle className="text-base">
                {currentPrep.candidateName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <TypewriterParagraph
                  text={currentPrep.summary}
                  speed={200}
                  delay={shouldAnimate ? 500 : 0}
                  skipAnimation={!shouldAnimate}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`p-4 bg-success-light rounded-apple ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: shouldAnimate ? "300ms" : "0ms" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      Matches JD
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <TypewriterParagraph
                      text={currentPrep.matchOverview}
                      speed={180}
                      delay={shouldAnimate ? 800 : 0}
                      skipAnimation={!shouldAnimate}
                    />
                  </div>
                </div>

                <div className={`p-4 bg-warning-light rounded-apple ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: shouldAnimate ? "400ms" : "0ms" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning">
                      Areas to Explore
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <TypewriterParagraph
                      text={currentPrep.gapOverview}
                      speed={180}
                      delay={shouldAnimate ? 1000 : 0}
                      skipAnimation={!shouldAnimate}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Questions Table with animation */}
          <div className={shouldAnimate ? 'animate-scale-in' : ''} style={{ animationDelay: shouldAnimate ? "200ms" : "0ms" }}>
            <QuestionsTable questions={currentPrep.questions} candidateId={selectedCandidateId || undefined} isNewData={shouldAnimate} />
          </div>
        </div>
      )}

      {isLoading && !currentPrep && (
        <div className="space-y-6">
          {/* Skeleton card while loading */}
          <AnimatedCardSkeleton className="h-64" />
          <div className="flex items-center justify-center py-4">
            <Spinner className="mr-3" />
            <span className="text-gray-500">Generating interview prep...</span>
          </div>
        </div>
      )}
    </div>
  );
}
