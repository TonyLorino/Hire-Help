"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Sparkles, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { generateId, formatDate } from "@/lib/utils";
import { CandidateSelector } from "./CandidateSelector";

type OverlayState = "idle" | "focused" | "expanded";

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-sm">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-bold text-base mb-2 mt-3 first:mt-0">{children}</h3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="font-semibold text-sm mb-2 mt-3 first:mt-0">{children}</h4>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="font-medium text-sm mb-1 mt-2 first:mt-0">{children}</h5>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    ) : (
      <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 italic my-2">{children}</blockquote>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-200 dark:bg-gray-700 font-semibold text-left">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>
  ),
  hr: () => <hr className="my-3 border-gray-300 dark:border-gray-600" />,
};

export function OverlayChatBox() {
  const [overlayState, setOverlayState] = useState<OverlayState>("idle");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const updateChatMessage = useAppStore((state) => state.updateChatMessage);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);
  const selectedCandidateId = useAppStore((state) => state.selectedCandidateId);
  const analysisResults = useAppStore((state) => state.analysisResults);
  const sidebarExpanded = useAppStore((state) => state.sidebarExpanded);
  
  const sidebarWidth = sidebarExpanded ? 200 : 60;

  const isIdle = overlayState === "idle";
  const isFocused = overlayState === "focused";
  const isExpanded = overlayState === "expanded";
  const hasMessages = chatMessages.length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [chatMessages, isExpanded, isLoading]);

  // Focus textarea when focused/expanded
  useEffect(() => {
    if ((isFocused || isExpanded) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused, isExpanded]);

  // Click outside handler
  useEffect(() => {
    if (isIdle) return;

    function handleClickOutside(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        if (!isLoading) {
          setOverlayState("idle");
        }
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [overlayState, isLoading, isIdle]);

  const handleOverlayClick = () => {
    if (isIdle) {
      setOverlayState(hasMessages ? "expanded" : "focused");
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !jobDescription) return;

    const userMessage = {
      id: generateId(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsLoading(true);
    setOverlayState("expanded");

    const assistantMessageId = generateId();
    setStreamingMessageId(assistantMessageId);
    addChatMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    });

    try {
      const selectedCandidate = selectedCandidateId
        ? candidates.find((c) => c.id === selectedCandidateId)
        : null;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          stream: true,
          context: {
            jobDescription,
            candidates: candidates.map((c) => ({
              id: c.id,
              name: c.name,
              text: c.resumeText,
            })),
            selectedCandidate: selectedCandidate
              ? {
                  id: selectedCandidate.id,
                  name: selectedCandidate.name,
                  text: selectedCandidate.resumeText,
                }
              : null,
            analysisResults,
          },
          history: chatMessages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let content = "";

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
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateChatMessage(
        assistantMessageId,
        "I'm sorry, I encountered an error processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  }, [input, isLoading, jobDescription, selectedCandidateId, candidates, analysisResults, chatMessages, addChatMessage, updateChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Compare all candidates",
    "Interview questions for top candidate",
    "Analyze job description",
    "Generate rejection email",
  ];

  // Positioning: centered within main content area (accounting for sidebar width)
  const panelStyle: React.CSSProperties = {
    bottom: isIdle ? "1rem" : "5rem",
    width: "100%",
    maxWidth: isIdle ? "28rem" : "42rem",
    left: `calc(${sidebarWidth}px + (100vw - ${sidebarWidth}px) / 2)`,
    transform: `translateX(-50%) translateY(${isIdle ? "0" : "-4px"}) scale(${isIdle ? "1" : "1.01"})`,
    transition: "bottom 300ms cubic-bezier(0.4, 0, 0.2, 1), max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1), left 200ms ease-out",
  };

  return (
    <>
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: isIdle ? "transparent" : "rgba(0,0,0,0.15)",
          backdropFilter: isIdle ? "none" : "blur(2px)",
          pointerEvents: isIdle ? "none" : "auto",
          opacity: isIdle ? 0 : 1,
          transition: "opacity 300ms ease-out, background-color 300ms ease-out, backdrop-filter 300ms ease-out",
        }}
      />

      {/* Overlay panel */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed z-50 px-4"
        style={panelStyle}
      >
        <div
          className={`rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
            isIdle ? "shadow-md dark:shadow-none" : "shadow-xl dark:shadow-none"
          } ${isExpanded ? "overflow-hidden" : ""}`}
          style={{ transition: "box-shadow 300ms ease-out" }}
        >
          {/* Header - shown when expanded with messages */}
          {isExpanded && hasMessages && (
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  AI Assistant
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Click outside to minimize
              </span>
            </div>
          )}

          {/* Messages area - only when expanded with messages */}
          {isExpanded && hasMessages && (
            <div className="max-h-[50vh] overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="text-sm prose-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {streamingMessageId === message.id && (
                            <span className="inline-block w-2 h-4 ml-0.5 bg-primary/70 animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                      {streamingMessageId !== message.id && (
                        <p
                          className={`text-xs mt-1.5 ${
                            message.role === "user"
                              ? "text-white/70"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {formatDate(message.timestamp)}
                        </p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Suggested prompts - only when focused (no messages yet) */}
          {isFocused && !hasMessages && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Assistant</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ask about candidates or job descriptions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInput(prompt);
                    }}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Candidate selector - when not idle and has candidates */}
          {!isIdle && candidates.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <CandidateSelector />
            </div>
          )}

          {/* Input area */}
          <div
            className={`${isExpanded ? "border-t border-gray-200 dark:border-gray-700" : ""}`}
            style={{
              maxHeight: isIdle ? "56px" : undefined,
              overflow: isIdle ? "hidden" : undefined,
              transition: "max-height 300ms ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${isIdle ? "p-2" : "p-3 pb-3"}`}>
              <div className={`flex ${isIdle ? "items-center" : "items-end"} gap-2 px-3 py-2 transition-all ${
                isIdle 
                  ? "bg-transparent" 
                  : "rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              }`}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (isIdle) {
                      setOverlayState(hasMessages ? "expanded" : "focused");
                    }
                  }}
                  placeholder={
                    !jobDescription
                      ? "Upload a job description to start..."
                      : isIdle
                      ? "Ask AI assistant..."
                      : "Ask about candidates, job description, or interview prep..."
                  }
                  disabled={!jobDescription || isLoading}
                  className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-h-[24px] max-h-[120px] py-1"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !jobDescription}
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
