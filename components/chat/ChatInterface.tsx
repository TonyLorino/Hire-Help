"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "@/store/app-store";
import { generateId, formatDate } from "@/lib/utils";
import { CandidateSelector } from "./CandidateSelector";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMessages = useAppStore((state) => state.chatMessages);
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const jobDescription = useAppStore((state) => state.jobDescription);
  const candidates = useAppStore((state) => state.candidates);
  const selectedCandidateId = useAppStore((state) => state.selectedCandidateId);
  const analysisResults = useAppStore((state) => state.analysisResults);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

    try {
      const selectedCandidate = selectedCandidateId
        ? candidates.find((c) => c.id === selectedCandidateId)
        : null;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
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

      const data = await response.json();

      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        context: data.context,
      });
    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex flex-col h-full border-t border-gray-200 bg-white">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
                }`}
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-white/70"
                        : "text-gray-400"
                    }`}
                  >
                    {formatDate(message.timestamp)}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-gray-100 rounded-apple-lg px-4 py-3">
                  <Spinner size="sm" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Candidate Selector */}
      {candidates.length > 0 && <CandidateSelector />}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
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
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !jobDescription}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
