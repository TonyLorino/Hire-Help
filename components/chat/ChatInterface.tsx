"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/app-store";
import { generateId, formatDate } from "@/lib/utils";
import { CandidateSelector } from "./CandidateSelector";

// Custom components for markdown rendering
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
      <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    ) : (
      <code className="block bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-gray-300 pl-3 italic my-2">{children}</blockquote>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-gray-300 px-2 py-1 bg-gray-200 font-semibold text-left">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-gray-300 px-2 py-1">{children}</td>
  ),
  hr: () => <hr className="my-3 border-gray-300" />,
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const updateChatMessage = useAppStore((state) => state.updateChatMessage);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);
  const selectedCandidateId = useAppStore((state) => state.selectedCandidateId);
  const analysisResults = useAppStore((state) => state.analysisResults);

  // Scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: generateId(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsLoading(true);

    // Create placeholder message for streaming
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
          history: chatMessages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      // Handle streaming response
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
              // Ignore parsing errors for incomplete JSON
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Analyze the job description for improvements",
    "Compare all candidates and recommend who to interview",
    "What questions should I ask the top candidate?",
    "Generate a rejection email for eliminated candidates",
  ];

  // Calculate the height needed for fixed elements (candidate selector + input)
  const fixedBottomHeight = candidates.length > 0 ? 160 : 110;

  return (
    <div className="relative h-full border-t border-gray-200 bg-white overflow-hidden">
      {/* Chat Messages - takes remaining space above fixed bottom */}
      <div style={{ height: `calc(100% - ${fixedBottomHeight}px)` }}>
        <ScrollArea className="h-full p-4" viewportRef={viewportRef}>
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">
              AI Assistant Ready
            </h4>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Ask questions about job descriptions, candidates, or get help with interview preparation.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-apple-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
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
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-white/70"
                          : "text-gray-400"
                      }`}
                    >
                      {formatDate(message.timestamp)}
                    </p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        </ScrollArea>
      </div>

      {/* Fixed bottom section - Candidate Selector + Input */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white"
        style={{ height: `${fixedBottomHeight}px` }}
      >
        {/* Candidate Selector */}
        {candidates.length > 0 && <CandidateSelector />}

        {/* Input Area - Always visible */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                jobDescription
                  ? "Ask about candidates, job description, or interview prep..."
                  : "Upload a job description to start chatting..."
              }
              disabled={!jobDescription || isLoading}
              className="resize-none min-h-[60px]"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !jobDescription}
              size="icon"
              className="flex-shrink-0 self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
