"use client";

import { useState } from "react";
import { User, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";
import { generateId } from "@/lib/utils";

export function InterviewNotesView() {
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [loadingCandidateId, setLoadingCandidateId] = useState<string | null>(null);

  const candidates = useAppStore((state) => state.candidates);
  const interviewNotes = useAppStore((state) => state.interviewNotes);
  const interviewNotesAnalyses = useAppStore((state) => state.interviewNotesAnalyses);
  const setInterviewNotes = useAppStore((state) => state.setInterviewNotes);
  const setInterviewNotesAnalysis = useAppStore((state) => state.setInterviewNotesAnalysis);
  const setSelectedCandidate = useAppStore((state) => state.setSelectedCandidate);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const updateChatMessage = useAppStore((state) => state.updateChatMessage);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const analysisResults = useAppStore((state) => state.analysisResults);

  const handleNotesChange = (candidateId: string, notes: string) => {
    setLocalNotes((prev) => ({ ...prev, [candidateId]: notes }));
  };

  const getNotes = (candidateId: string) => {
    // Return local notes if available, otherwise stored notes
    if (localNotes[candidateId] !== undefined) {
      return localNotes[candidateId];
    }
    return interviewNotes.get(candidateId)?.notes || "";
  };

  const handleAnalyzeNotes = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const notes = getNotes(candidateId);
    if (!notes.trim()) return;

    setLoadingCandidateId(candidateId);

    // Save notes to store
    setInterviewNotes(candidateId, notes);

    // Set selected candidate for chat context
    setSelectedCandidate(candidateId);

    // Create placeholder message for streaming
    const assistantMessageId = generateId();
    addChatMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      context: { type: "post-interview", candidateId },
    });

    try {
      // Get JD match info for this candidate
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

      // Handle streaming response
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
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }

      // Store the analysis if received
      if (analysisData) {
        setInterviewNotesAnalysis(candidateId, analysisData);
      }

      // Scroll chat into view
      setTimeout(() => {
        const chatArea = document.querySelector('[data-chat-messages]');
        if (chatArea) {
          chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
        }
      }, 100);

    } catch (error) {
      console.error("Interview notes analysis error:", error);
      updateChatMessage(
        assistantMessageId,
        "I'm sorry, I encountered an error analyzing the interview notes. Please try again."
      );
    } finally {
      setLoadingCandidateId(null);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Upload candidates to add interview notes
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Interview Notes
        </h3>
        <p className="text-sm text-gray-500">
          Paste your notes from each candidate&apos;s interview for AI-powered analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((candidate) => {
          const hasAnalysis = interviewNotesAnalyses.has(candidate.id);
          const isLoading = loadingCandidateId === candidate.id;
          const currentNotes = getNotes(candidate.id);

          return (
            <Card key={candidate.id} className="animate-fade-in">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {candidate.name}
                      </h4>
                      {hasAnalysis && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Analyzed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {candidate.location}
                    </div>
                  </div>
                </div>

                {/* Notes Textarea */}
                <div className="space-y-3">
                  <Textarea
                    value={currentNotes}
                    onChange={(e) => handleNotesChange(candidate.id, e.target.value)}
                    placeholder="Paste your interview notes here...

Include observations about:
• Communication skills
• Technical knowledge
• Cultural fit
• Strengths and concerns
• Overall impression"
                    className="min-h-[180px] resize-y text-sm"
                    disabled={isLoading}
                  />

                  <Button
                    onClick={() => handleAnalyzeNotes(candidate.id)}
                    disabled={!currentNotes.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Notes...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Analyze Notes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
