"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SetupPage } from "@/components/pages/SetupPage";
import { AnalysisPage } from "@/components/pages/AnalysisPage";
import { InterviewPrepView } from "@/components/interview/InterviewPrepView";
import { RecommendationsView } from "@/components/recommendations/RecommendationsView";
import { OverlayChatBox } from "@/components/chat/OverlayChatBox";
import { useAppStore } from "@/store/app-store";

export default function Home() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const candidates = useAppStore((state) => state.candidates);
  const analysisResults = useAppStore((state) => state.analysisResults);

  const hasCandidates = candidates.length > 0;
  const hasAnalysis = !!analysisResults;

  const renderContent = () => {
    switch (activeTab) {
      case "setup":
        return <SetupPage />;
      case "summary":
      case "jd-match":
      case "comparison":
        return hasAnalysis ? (
          <div className="h-full overflow-y-auto pb-24">
            <AnalysisPage />
          </div>
        ) : (
          <EmptyTabState message="Upload candidates to view analysis" />
        );
      case "interview":
        return hasAnalysis ? (
          <div className="h-full overflow-y-auto pb-24">
            <InterviewPrepView />
          </div>
        ) : (
          <EmptyTabState message="Analysis required for interview prep" />
        );
      case "recommendations":
        return hasAnalysis ? (
          <div className="h-full overflow-y-auto pb-24">
            <RecommendationsView />
          </div>
        ) : (
          <EmptyTabState message="Analysis required for recommendations" />
        );
      default:
        return <SetupPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasCandidates={hasCandidates}
          hasAnalysis={hasAnalysis}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-gray-50/30">
          {renderContent()}
        </main>
      </div>

      {/* Floating Chat Overlay */}
      <OverlayChatBox />
    </div>
  );
}

function EmptyTabState({ message }: { message: string }) {
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Not Available Yet</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        <button
          onClick={() => setActiveTab("setup")}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Go to Setup →
        </button>
      </div>
    </div>
  );
}
