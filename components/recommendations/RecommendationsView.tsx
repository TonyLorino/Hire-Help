"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { User, MapPin, CheckCircle2, XCircle, ArrowRight, FileText, Printer, Copy, Check, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { AnimatedCard, AnimatedCardSkeleton } from "@/components/ui/animated-card";
import { TypewriterParagraph, TypewriterList } from "@/components/ui/typewriter-text";
import type { InterviewDecision, RecommendationLevel, InterviewNotesAnalysis, Candidate } from "@/types";

const decisionLabels: Record<InterviewDecision, string> = {
  advance: "Advance",
  hold: "Hold",
  reject: "Reject",
};

const decisionColors: Record<InterviewDecision, string> = {
  advance: "bg-success-light text-success border-success/20",
  hold: "bg-warning-light text-warning border-warning/20",
  reject: "bg-danger-light text-danger border-danger/20",
};

// Helper to render inline markdown (bold/italic) in text
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return text;
  
  // Split on **bold** and *italic* patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Helper to truncate text to a specified number of sentences with optional character limit
function truncateToSentences(text: string, count: number, maxChars?: number): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let result = sentences.slice(0, count).join(" ").trim();
  
  // Apply character limit if specified
  if (maxChars && result.length > maxChars) {
    result = result.substring(0, maxChars).trim();
    // Try to end at a word boundary
    const lastSpace = result.lastIndexOf(" ");
    if (lastSpace > maxChars * 0.7) {
      result = result.substring(0, lastSpace);
    }
    result += "...";
  }
  
  return result;
}

export function RecommendationsView() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [copiedTable, setCopiedTable] = React.useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [visibleRows, setVisibleRows] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const comparisonTableRef = useRef<HTMLDivElement>(null);

  const candidates = useAppStore((state) => state.candidates);
  const analysisResults = useAppStore((state) => state.analysisResults);
  const interviewNotesAnalyses = useAppStore((state) => state.interviewNotesAnalyses);
  const interviewNotes = useAppStore((state) => state.interviewNotes);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  // Check if we have any interview notes analyzed
  const hasAnalyzedNotes = interviewNotesAnalyses.size > 0;

  // Get candidates with analyzed notes
  const analyzedCandidates = candidates.filter((c) =>
    interviewNotesAnalyses.has(c.id)
  );

  // Sort by recommendation (advance > hold > reject)
  const sortedCandidates = [...analyzedCandidates].sort((a, b) => {
    const analysisA = interviewNotesAnalyses.get(a.id);
    const analysisB = interviewNotesAnalyses.get(b.id);
    const order = { advance: 0, hold: 1, reject: 2 };
    return (order[analysisA?.recommendation || "hold"] || 1) - (order[analysisB?.recommendation || "hold"] || 1);
  });

  // Stagger card visibility animation
  useEffect(() => {
    setVisibleCards(new Set());
    setAnimationKey(prev => prev + 1);
    
    sortedCandidates.forEach((candidate, index) => {
      setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, candidate.id]));
      }, index * 150);
    });
  }, [interviewNotesAnalyses, candidates]);

  // Stagger table row visibility animation
  useEffect(() => {
    if (sortedCandidates.length > 1) {
      setVisibleRows(new Set());
      
      sortedCandidates.forEach((candidate, index) => {
        setTimeout(() => {
          setVisibleRows(prev => new Set([...prev, candidate.id]));
        }, index * 200 + 500); // Start after cards begin appearing
      });
    }
  }, [interviewNotesAnalyses, candidates]);

  // Generate plain text format for copying
  const generatePlainText = useCallback((candidate: Candidate, analysis: InterviewNotesAnalysis): string => {
    const comparison = analysisResults?.comparisons?.find(
      (c) => c.candidateId === candidate.id || c.name === candidate.name
    );
    
    // Remove markdown formatting from text
    const stripMarkdown = (text: string): string => {
      return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    };

    let text = `CANDIDATE RECOMMENDATION: ${candidate.name}\n`;
    text += `Location: ${candidate.location}\n`;
    text += `Decision: ${decisionLabels[analysis.recommendation].toUpperCase()}\n`;
    if (comparison) {
      text += `JD Match: ${comparison.jdMatchPercent}%\n`;
    }
    text += `\n`;

    text += `INTERVIEW SYNOPSIS\n`;
    text += `${analysis.synopsis || "No synopsis available."}\n\n`;

    const strengths = [
      ...(analysis.interviewMatches || []).slice(0, 3),
      ...(analysis.resumeMatches || []).slice(0, 2),
    ];
    if (strengths.length > 0) {
      text += `STRENGTHS & MATCHES\n`;
      strengths.forEach((item) => {
        text += `• ${stripMarkdown(item)}\n`;
      });
      text += `\n`;
    }

    const concerns = [
      ...(analysis.interviewGaps || []).slice(0, 3),
      ...(analysis.resumeGaps || []).slice(0, 2),
    ];
    if (concerns.length > 0) {
      text += `CONCERNS & GAPS\n`;
      concerns.forEach((item) => {
        text += `• ${stripMarkdown(item)}\n`;
      });
      text += `\n`;
    }

    if (analysis.nextSteps && analysis.nextSteps.length > 0) {
      text += `SUGGESTED NEXT STEPS\n`;
      analysis.nextSteps.forEach((step) => {
        text += `→ ${stripMarkdown(step)}\n`;
      });
    }

    return text;
  }, [analysisResults]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (candidateId: string, candidate: Candidate, analysis: InterviewNotesAnalysis) => {
    const text = generatePlainText(candidate, analysis);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(candidateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }, [generatePlainText]);

  // Handle print to PDF
  const handlePrint = useCallback((candidateId: string, candidate: Candidate, analysis: InterviewNotesAnalysis) => {
    const comparison = analysisResults?.comparisons?.find(
      (c) => c.candidateId === candidate.id || c.name === candidate.name
    );
    
    // Remove markdown formatting from text
    const stripMarkdown = (text: string): string => {
      return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    };

    const strengths = [
      ...(analysis.interviewMatches || []).slice(0, 3),
      ...(analysis.resumeMatches || []).slice(0, 2),
    ];
    const concerns = [
      ...(analysis.interviewGaps || []).slice(0, 3),
      ...(analysis.resumeGaps || []).slice(0, 2),
    ];

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recommendation - ${candidate.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
          h1 { font-size: 24px; margin-bottom: 4px; color: #111; }
          .subtitle { color: #666; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; }
          .badge-advance { background: #dcfce7; color: #166534; }
          .badge-hold { background: #fef9c3; color: #854d0e; }
          .badge-reject { background: #fee2e2; color: #991b1b; }
          .section { margin: 24px 0; }
          .section-title { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .synopsis { font-size: 14px; line-height: 1.6; color: #444; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .box { padding: 16px; border-radius: 8px; }
          .box-green { background: #f0fdf4; }
          .box-red { background: #fef2f2; }
          .box-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
          .box-title-green { color: #166534; }
          .box-title-red { color: #991b1b; }
          ul { margin: 0; padding-left: 16px; }
          li { font-size: 13px; line-height: 1.5; color: #444; margin-bottom: 4px; }
          .next-steps { background: #f9fafb; padding: 16px; border-radius: 8px; }
          .next-step { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #444; margin-bottom: 4px; }
          .arrow { color: #3b82f6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${candidate.name}</h1>
        <div class="subtitle">
          ${candidate.location}${comparison ? ` • JD Match: ${comparison.jdMatchPercent}%` : ''}
        </div>
        <span class="badge badge-${analysis.recommendation}">${decisionLabels[analysis.recommendation]}</span>
        
        <div class="section">
          <div class="section-title">Interview Synopsis</div>
          <div class="synopsis">${analysis.synopsis ? stripMarkdown(analysis.synopsis) : "No synopsis available."}</div>
        </div>
        
        <div class="grid">
          <div class="box box-green">
            <div class="box-title box-title-green">Strengths & Matches</div>
            <ul>
              ${strengths.map(item => `<li>${stripMarkdown(item)}</li>`).join('')}
            </ul>
          </div>
          <div class="box box-red">
            <div class="box-title box-title-red">Concerns & Gaps</div>
            <ul>
              ${concerns.map(item => `<li>${stripMarkdown(item)}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        ${analysis.nextSteps && analysis.nextSteps.length > 0 ? `
          <div class="section">
            <div class="next-steps">
              <div class="section-title">Suggested Next Steps</div>
              ${analysis.nextSteps.map(step => `
                <div class="next-step">
                  <span class="arrow">→</span>
                  <span>${stripMarkdown(step)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [analysisResults]);

  // Handle copy comparison table to clipboard
  const handleCopyComparisonTable = useCallback(async () => {
    const stripMarkdown = (text: string): string => {
      return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    };

    let text = "CANDIDATE COMPARISON\n";
    text += "=".repeat(50) + "\n\n";

    sortedCandidates.forEach((candidate) => {
      const analysis = interviewNotesAnalyses.get(candidate.id);
      const comparison = analysisResults?.comparisons?.find(
        (c) => c.candidateId === candidate.id || c.name === candidate.name
      );
      if (!analysis) return;

      text += `${candidate.name} (${candidate.location})\n`;
      text += `-`.repeat(30) + "\n";
      if (comparison) {
        text += `JD Match: ${comparison.jdMatchPercent}%\n`;
      }
      text += `Recommendation: ${decisionLabels[analysis.recommendation]}\n\n`;

      text += `Summary:\n${stripMarkdown(truncateToSentences(analysis.synopsis || "", 2))}\n\n`;

      if (analysis.interviewMatches?.length) {
        text += `Interview Highlights:\n`;
        analysis.interviewMatches.slice(0, 8).forEach((item) => {
          text += `  • ${stripMarkdown(item)}\n`;
        });
        text += "\n";
      }

      if (analysis.interviewGaps?.length) {
        text += `Key Concerns:\n`;
        analysis.interviewGaps.slice(0, 8).forEach((item) => {
          text += `  • ${stripMarkdown(item)}\n`;
        });
        text += "\n";
      }

      text += "\n";
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2000);
    } catch (err) {
      console.error("Failed to copy comparison table:", err);
    }
  }, [sortedCandidates, interviewNotesAnalyses, analysisResults]);

  // Handle print comparison table as PDF
  const handlePrintComparisonTable = useCallback(() => {
    const stripMarkdown = (text: string): string => {
      return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    };

    const rows = sortedCandidates.map((candidate) => {
      const analysis = interviewNotesAnalyses.get(candidate.id);
      const comparison = analysisResults?.comparisons?.find(
        (c) => c.candidateId === candidate.id || c.name === candidate.name
      );
      if (!analysis) return "";

      const highlights = analysis.interviewMatches?.slice(0, 8).map(item => 
        `<li>${stripMarkdown(item)}</li>`
      ).join("") || "";

      const concerns = analysis.interviewGaps?.slice(0, 8).map(item => 
        `<li>${stripMarkdown(item)}</li>`
      ).join("") || "";

      return `
        <tr>
          <td>
            <strong>${candidate.name}</strong><br/>
            <span class="location">${candidate.location}</span>
          </td>
          <td class="center">${comparison ? `${comparison.jdMatchPercent}%` : 'N/A'}</td>
          <td class="summary">${analysis.synopsis ? stripMarkdown(truncateToSentences(analysis.synopsis, 2)) : 'N/A'}</td>
          <td><ul class="highlights">${highlights}</ul></td>
          <td><ul class="concerns">${concerns}</ul></td>
          <td class="center"><span class="badge badge-${analysis.recommendation}">${decisionLabels[analysis.recommendation]}</span></td>
        </tr>
      `;
    }).join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Candidate Comparison</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #333; }
          h1 { font-size: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #f5f5f5; padding: 10px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
          td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
          .center { text-align: center; }
          .location { color: #666; font-size: 10px; }
          .summary { max-width: 200px; line-height: 1.4; }
          ul { margin: 0; padding-left: 14px; }
          li { margin-bottom: 4px; line-height: 1.3; }
          .highlights li::marker { color: #16a34a; }
          .concerns li::marker { color: #dc2626; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-weight: 600; font-size: 10px; }
          .badge-advance { background: #dcfce7; color: #166534; }
          .badge-hold { background: #fef9c3; color: #854d0e; }
          .badge-reject { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>Candidate Comparison</h1>
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>JD Match</th>
              <th>Summary</th>
              <th>Interview Highlights</th>
              <th>Key Concerns</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [sortedCandidates, interviewNotesAnalyses, analysisResults]);

  // Handle export comparison table as PNG
  const handleExportComparisonPng = useCallback(async () => {
    if (!comparisonTableRef.current) return;
    
    // Find the scrollable container inside the card
    const scrollContainer = comparisonTableRef.current.querySelector('[data-scroll-container]') as HTMLElement;
    
    // Store original styles
    const originalMaxHeight = scrollContainer?.style.maxHeight;
    const originalOverflow = scrollContainer?.style.overflow;
    
    // Temporarily remove constraints to show full table
    if (scrollContainer) {
      scrollContainer.style.maxHeight = 'none';
      scrollContainer.style.overflow = 'visible';
    }
    
    try {
      const dataUrl = await toPng(comparisonTableRef.current, { 
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'candidate-comparison.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export comparison table as PNG:", err);
    } finally {
      // Restore original styles
      if (scrollContainer) {
        scrollContainer.style.maxHeight = originalMaxHeight || '';
        scrollContainer.style.overflow = originalOverflow || '';
      }
    }
  }, []);

  // Handle export recommendation card as PNG
  const handleExportCardPng = useCallback(async (candidateId: string, candidateName: string) => {
    const cardEl = cardRefs.current.get(candidateId);
    if (!cardEl) return;
    try {
      const dataUrl = await toPng(cardEl, { 
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `recommendation-${candidateName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export recommendation card as PNG:", err);
    }
  }, []);

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Upload candidates to view recommendations
      </div>
    );
  }

  if (!hasAnalyzedNotes) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h4 className="font-medium text-gray-900 mb-2">
          No Interview Notes Analyzed Yet
        </h4>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          Add interview notes for candidates and analyze them to see comprehensive recommendations.
        </p>
        <Button onClick={() => setActiveTab("notes")}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Go to Interview Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Candidate Recommendations
        </h3>
        <p className="text-sm text-gray-500">
          Comprehensive analysis based on resumes, JD matching, and interview notes
        </p>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {sortedCandidates.map((candidate, cardIndex) => {
          const analysis = interviewNotesAnalyses.get(candidate.id);
          const jdMatch = analysisResults?.jdMatches?.find(
            (m) => m.candidateId === candidate.id || m.name === candidate.name
          );
          const comparison = analysisResults?.comparisons?.find(
            (c) => c.candidateId === candidate.id || c.name === candidate.name
          );
          const isVisible = visibleCards.has(candidate.id);

          if (!analysis) return null;

          const strengths = [
            ...(analysis.interviewMatches || []).slice(0, 3),
            ...(analysis.resumeMatches || []).slice(0, 2),
          ];
          const concerns = [
            ...(analysis.interviewGaps || []).slice(0, 3),
            ...(analysis.resumeGaps || []).slice(0, 2),
          ];

          return (
            <AnimatedCard
              key={`${candidate.id}-${animationKey}`}
              delay={cardIndex * 150}
              duration={500}
              className="overflow-hidden"
            >
              <div
                ref={(el) => {
                  if (el) cardRefs.current.set(candidate.id, el);
                }}
              >
                {/* Recommendation Header */}
                <div
                  className={`px-5 py-3 border-b ${decisionColors[analysis.recommendation]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <div className="flex items-center gap-1 text-sm opacity-80">
                          <MapPin className="h-3.5 w-3.5" />
                          {candidate.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/30 hover:bg-white/50"
                          onClick={() => handlePrint(candidate.id, candidate, analysis)}
                          title="Print as PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/30 hover:bg-white/50"
                          onClick={() => handleExportCardPng(candidate.id, candidate.name)}
                          title="Save as PNG"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/30 hover:bg-white/50"
                          onClick={() => handleCopy(candidate.id, candidate, analysis)}
                          title="Copy to clipboard"
                        >
                          {copiedId === candidate.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={analysis.recommendation as RecommendationLevel}
                          className="text-sm"
                        >
                          {decisionLabels[analysis.recommendation]}
                        </Badge>
                        {comparison && (
                          <div className="text-xs mt-1 opacity-80">
                            JD Match: {comparison.jdMatchPercent}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Synopsis with typewriter */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Interview Synopsis
                    </h5>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {analysis.synopsis ? (
                        <TypewriterParagraph
                          text={analysis.synopsis}
                          speed={200}
                          delay={cardIndex * 150 + 600}
                        />
                      ) : (
                        "No synopsis available."
                      )}
                    </div>
                  </div>

                  {/* Matches and Gaps Grid */}
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    {/* Strengths */}
                    <div className="p-4 bg-success-light/50 rounded-apple animate-fade-in-up" style={{ animationDelay: `${cardIndex * 150 + 300}ms` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          Strengths & Matches
                        </span>
                      </div>
                      <TypewriterList
                        items={strengths}
                        speed={100}
                        staggerDelay={150}
                        initialDelay={cardIndex * 150 + 800}
                        className="space-y-1.5"
                        itemClassName="text-xs text-gray-600"
                        renderBullet={() => <span className="text-success mt-0.5">•</span>}
                      />
                    </div>

                    {/* Concerns */}
                    <div className="p-4 bg-danger-light/50 rounded-apple animate-fade-in-up" style={{ animationDelay: `${cardIndex * 150 + 400}ms` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-4 w-4 text-danger" />
                        <span className="text-sm font-medium text-danger">
                          Concerns & Gaps
                        </span>
                      </div>
                      <TypewriterList
                        items={concerns}
                        speed={100}
                        staggerDelay={150}
                        initialDelay={cardIndex * 150 + 1000}
                        className="space-y-1.5"
                        itemClassName="text-xs text-gray-600"
                        renderBullet={() => <span className="text-danger mt-0.5">•</span>}
                      />
                    </div>
                  </div>

                  {/* Next Steps */}
                  {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-apple animate-fade-in-up" style={{ animationDelay: `${cardIndex * 150 + 500}ms` }}>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Suggested Next Steps
                      </h5>
                      <TypewriterList
                        items={analysis.nextSteps}
                        speed={100}
                        staggerDelay={120}
                        initialDelay={cardIndex * 150 + 1200}
                        className="space-y-1"
                        itemClassName="text-xs text-gray-600"
                        renderBullet={() => <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />}
                      />
                    </div>
                  )}
                </CardContent>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Comparison Table */}
      {sortedCandidates.length > 1 && (
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-900">
              Candidate Comparison
            </h4>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handlePrintComparisonTable}
                title="Print as PDF"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleExportComparisonPng}
                title="Save as PNG"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCopyComparisonTable}
                title="Copy to clipboard"
              >
                {copiedTable ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden animate-scale-in" ref={comparisonTableRef} style={{ animationDelay: "400ms" }}>
            <div className="max-h-[calc(100vh-400px)] min-h-[250px] overflow-auto" data-scroll-container>
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_theme(colors.gray.200)]">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      JD Match
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Interview Highlights
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Key Concerns
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCandidates.map((candidate, rowIndex) => {
                    const analysis = interviewNotesAnalyses.get(candidate.id);
                    const comparison = analysisResults?.comparisons?.find(
                      (c) => c.candidateId === candidate.id || c.name === candidate.name
                    );
                    const isVisible = visibleRows.has(candidate.id);

                    if (!analysis) return null;

                    return (
                      <tr
                        key={`${candidate.id}-table-${animationKey}`}
                        className={`hover:bg-gray-50 transition-all duration-300 ${
                          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <span className="font-medium text-gray-900">
                              {candidate.name}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {comparison ? (
                            <div className={`inline-flex items-center justify-center transition-opacity duration-500 ${
                              isVisible ? "opacity-100" : "opacity-0"
                            }`} style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}>
                              <div className="relative w-10 h-10">
                                <svg className="w-10 h-10 transform -rotate-90">
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="none"
                                    className="text-gray-200"
                                  />
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray={isVisible ? `${comparison.jdMatchPercent * 1.005} 100.5` : "0 100.5"}
                                    className="text-primary transition-all duration-1000"
                                    style={{ transitionDelay: isVisible ? `${rowIndex * 200 + 300}ms` : "0ms" }}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                                  {comparison.jdMatchPercent}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {analysis.synopsis ? renderInlineMarkdown(truncateToSentences(analysis.synopsis, 2)) : "No summary available."}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <ul className="space-y-1.5">
                            {analysis.interviewMatches?.slice(0, 8).map((item, i) => (
                              <li
                                key={i}
                                className={`flex items-start gap-1 text-xs text-gray-600 transition-opacity duration-200 ${
                                  isVisible ? "opacity-100" : "opacity-0"
                                }`}
                                style={{ transitionDelay: isVisible ? `${i * 50 + 100}ms` : "0ms" }}
                              >
                                <CheckCircle2 className="h-3 w-3 mt-0.5 text-success flex-shrink-0" />
                                <span>{renderInlineMarkdown(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-4">
                          <ul className="space-y-1.5">
                            {analysis.interviewGaps?.slice(0, 8).map((item, i) => (
                              <li
                                key={i}
                                className={`flex items-start gap-1 text-xs text-gray-600 transition-opacity duration-200 ${
                                  isVisible ? "opacity-100" : "opacity-0"
                                }`}
                                style={{ transitionDelay: isVisible ? `${i * 50 + 100}ms` : "0ms" }}
                              >
                                <XCircle className="h-3 w-3 mt-0.5 text-danger flex-shrink-0" />
                                <span>{renderInlineMarkdown(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className={`transition-all duration-300 ${
                            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                          }`} style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}>
                            <Badge
                              variant={analysis.recommendation as RecommendationLevel}
                            >
                              {decisionLabels[analysis.recommendation]}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Candidates without analysis */}
      {candidates.length > analyzedCandidates.length && (
        <div className="p-4 bg-gray-50 rounded-apple">
          <p className="text-sm text-gray-500">
            {candidates.length - analyzedCandidates.length} candidate(s) have not been analyzed yet.{" "}
            <button
              onClick={() => setActiveTab("notes")}
              className="text-primary hover:underline"
            >
              Add interview notes
            </button>{" "}
            to include them in recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
