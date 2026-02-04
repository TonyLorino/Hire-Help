"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GripHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { ChatInterface } from "@/components/chat/ChatInterface";

// Minimum height to ensure input is always visible (input ~100px + candidate selector ~50px + buffer)
const MIN_CHAT_HEIGHT = 220;
const MAX_CHAT_HEIGHT_PERCENT = 0.6;

export default function Home() {
  const [chatHeight, setChatHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize chat height to 35% of viewport on mount
  useEffect(() => {
    const maxH = window.innerHeight * MAX_CHAT_HEIGHT_PERCENT;
    const targetH = window.innerHeight * 0.35;
    setChatHeight(Math.max(MIN_CHAT_HEIGHT, Math.min(targetH, maxH)));
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = chatHeight;
  }, [chatHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = dragStartY.current - e.clientY;
      const maxHeight = window.innerHeight * MAX_CHAT_HEIGHT_PERCENT;
      const newHeight = Math.min(Math.max(dragStartHeight.current + delta, MIN_CHAT_HEIGHT), maxHeight);
      setChatHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" ref={containerRef}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Job Description & Resumes */}
        <div className="w-[380px] min-w-[380px] max-w-[380px] flex-shrink-0 overflow-clip relative isolate">
          <LeftPanel />
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <RightPanel />
          </div>

          {/* Chat Frame Resize Handle */}
          <div
            className={`flex items-center justify-center h-2 cursor-ns-resize bg-gray-100 hover:bg-gray-200 transition-colors border-t border-gray-200 ${
              isDragging ? "bg-gray-200" : ""
            }`}
            onMouseDown={handleDragStart}
          >
            <GripHorizontal className="h-3 w-3 text-gray-400" />
          </div>

          {/* Chat Interface */}
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{ height: `${chatHeight}px`, minHeight: `${MIN_CHAT_HEIGHT}px` }}
          >
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
