"use client";

import { Header } from "@/components/layout/Header";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Job Description & Resumes */}
        <div className="w-[380px] flex-shrink-0 overflow-hidden">
          <LeftPanel />
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <RightPanel />
          </div>

          {/* Chat Interface */}
          <div className="h-[300px] flex-shrink-0">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
