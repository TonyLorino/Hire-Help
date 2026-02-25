"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, User, CheckCircle2, AlertCircle, Send, Loader2, RefreshCw, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore, hasBeenAnimated, markAsAnimated } from "@/store/app-store";
import { QuestionsTable } from "./QuestionsTable";
import { AnimatedCard, AnimatedCardSkeleton } from "@/components/ui/animated-card";
import { TypewriterParagraph } from "@/components/ui/typewriter-text";
import { generateId } from "@/lib/utils";

export function InterviewPrepView() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [justGenerated, setJustGenerated] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [notesModifiedAfterAnalysis, setNotesModifiedAfterAnalysis] = useState<Set<string>>(new Set());
  const [isAnalyzingNotes, setIsAnalyzingNotes] = useState(false);

  const candidates = useAppStore((state) => state.candidates);
  const interviewPreps = useAppStore((state) => state.interviewPreps);
  const setInterviewPrep = useAppStore((state) => state.setInterviewPrep);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const analysisResults = useAppStore((state) => state.analysisResults);
  const interviewNotes = useAppStore((state) => state.interviewNotes);
  const interviewNotesAnalyses = useAppStore((state) => state.interviewNotesAnalyses);
  const setInterviewNotes = useAppStore((state) => state.setInterviewNotes);
  const setInterviewNotesAnalysis = useAppStore((state) => state.setInterviewNotesAnalysis);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const updateChatMessage = useAppStore((state) => state.updateChatMessage);
  const setSelectedCandidate = useAppStore((state) => state.setSelectedCandidate);

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

  const getNotes = (candidateId: string) => {
    if (localNotes[candidateId] !== undefined) {
      return localNotes[candidateId];
    }
    return interviewNotes.get(candidateId)?.notes || "";
  };

  const handleNotesChange = (candidateId: string, notes: string) => {
    setLocalNotes((prev) => ({ ...prev, [candidateId]: notes }));
    
    if (interviewNotesAnalyses.has(candidateId)) {
      setNotesModifiedAfterAnalysis((prev) => new Set([...prev, candidateId]));
    }
  };

  const analyzeNotes = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const notes = getNotes(candidateId);
    if (!notes.trim()) return;

    setIsAnalyzingNotes(true);
    setInterviewNotes(candidateId, notes);
    setSelectedCandidate(candidateId);

    const assistantMessageId = generateId();
    addChatMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      context: { type: "post-interview", candidateId },
    });

    try {
      const jdMatch = analysisResults?.jdMatches?.find(
        (m) => m.candidateId === candidateId || m.name === candidate.name
      );

      const response = await fetch("/api/analyze-interview-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          candidateName: candidate.name,
          notes,
          resumeText: candidate.resumeText,
          jobDescription,
          jdMatchAnalysis: jdMatch,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze notes");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let content = "";
      let analysisData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
                updateChatMessage(assistantMessageId, content);
              }
              if (data.analysis) {
                analysisData = data.analysis;
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }

      if (analysisData) {
        setInterviewNotesAnalysis(candidateId, analysisData);
        setNotesModifiedAfterAnalysis((prev) => {
          const next = new Set(prev);
          next.delete(candidateId);
          return next;
        });
      }
    } catch (error) {
      console.error("Interview notes analysis error:", error);
      updateChatMessage(
        assistantMessageId,
        "I'm sorry, I encountered an error analyzing the interview notes. Please try again."
      );
    } finally {
      setIsAnalyzingNotes(false);
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
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Upload candidates to generate interview prep materials
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Interview Preparation
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select a candidate below to generate personalized interview questions and talking points.
          {!selectedCandidateId && <span className="text-primary font-medium ml-1">Select one to begin.</span>}
        </p>
      </div>

      {/* Candidate Selection */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {candidates.map((candidate) => {
            const hasPrep = interviewPreps.has(candidate.id);
            const isSelected = selectedCandidateId === candidate.id;
            return (
              <Button
                key={candidate.id}
                variant={isSelected ? "default" : "outline"}
                className={`relative justify-start h-auto py-3 px-4 ${
                  hasPrep && !isSelected ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 hover:bg-green-50 dark:hover:bg-green-900/30 pr-10" : ""
                }`}
                onClick={() => {
                  setSelectedCandidateId(candidate.id);
                  if (!hasPrep) {
                    generatePrep(candidate.id);
                  }
                }}
                disabled={isLoading && isSelected}
              >
                {hasPrep && !isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/50">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {isLoading && isSelected ? (
                  <Spinner size="sm" className="mr-2" />
                ) : hasPrep ? (
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${isSelected ? "text-white" : "text-green-600"}`} />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                <span className="truncate">{candidate.name}</span>
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
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <TypewriterParagraph
                  text={currentPrep.summary}
                  speed={200}
                  delay={shouldAnimate ? 500 : 0}
                  skipAnimation={!shouldAnimate}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`p-4 bg-success-light dark:bg-green-900/30 rounded-apple ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: shouldAnimate ? "300ms" : "0ms" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-success dark:text-green-400" />
                    <span className="text-sm font-medium text-success dark:text-green-400">
                      Matches JD
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <TypewriterParagraph
                      text={currentPrep.matchOverview}
                      speed={180}
                      delay={shouldAnimate ? 800 : 0}
                      skipAnimation={!shouldAnimate}
                    />
                  </div>
                </div>

                <div className={`p-4 bg-warning-light dark:bg-yellow-900/30 rounded-apple ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: shouldAnimate ? "400ms" : "0ms" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-warning dark:text-yellow-400" />
                    <span className="text-sm font-medium text-warning dark:text-yellow-400">
                      Areas to Explore
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
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

          {/* Interview Notes Section */}
          {selectedCandidateId && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Interview Notes</CardTitle>
                    {interviewNotesAnalyses.has(selectedCandidateId) && !notesModifiedAfterAnalysis.has(selectedCandidateId) && (
                      <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Paste your notes from the interview for AI-powered analysis and recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={getNotes(selectedCandidateId)}
                  onChange={(e) => handleNotesChange(selectedCandidateId, e.target.value)}
                  placeholder="Paste your interview notes here...

Include observations about:
• Communication skills
• Technical knowledge
• Cultural fit
• Strengths and concerns
• Overall impression"
                  className="min-h-[150px] resize-y text-sm"
                  disabled={isAnalyzingNotes}
                />
                
                <Button
                  onClick={() => analyzeNotes(selectedCandidateId)}
                  disabled={!getNotes(selectedCandidateId).trim() || isAnalyzingNotes}
                  className="w-full"
                  variant={notesModifiedAfterAnalysis.has(selectedCandidateId) ? "default" : interviewNotesAnalyses.has(selectedCandidateId) ? "outline" : "default"}
                >
                  {isAnalyzingNotes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Notes...
                    </>
                  ) : notesModifiedAfterAnalysis.has(selectedCandidateId) ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-analyze Notes
                    </>
                  ) : interviewNotesAnalyses.has(selectedCandidateId) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Notes Analyzed
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Notes
                    </>
                  )}
                </Button>

                {interviewNotesAnalyses.has(selectedCandidateId) && (
                  <div className="p-3 bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      Analysis complete! Check the chat panel for detailed recommendations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
            <span className="text-gray-500 dark:text-gray-400">Generating interview prep...</span>
          </div>
        </div>
      )}
    </div>
  );
}
