"use client";

import {
  Upload,
  BarChart3,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { ActiveTab } from "@/types";

interface NavItem {
  id: ActiveTab;
  icon: React.ElementType;
  label: string;
  enabledWhen: "always" | "hasCandidates" | "hasAnalysis";
}

const navItems: NavItem[] = [
  { id: "setup", icon: Upload, label: "Setup Analysis", enabledWhen: "always" },
  { id: "summary", icon: BarChart3, label: "Candidate Analysis", enabledWhen: "hasAnalysis" },
  { id: "interview", icon: MessageSquare, label: "Interview Prep", enabledWhen: "hasAnalysis" },
  { id: "recommendations", icon: Award, label: "Recommendations", enabledWhen: "hasAnalysis" },
];

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasCandidates: boolean;
  hasAnalysis: boolean;
}

export function Sidebar({ activeTab, onTabChange, hasCandidates, hasAnalysis }: SidebarProps) {
  const isExpanded = useAppStore((state) => state.sidebarExpanded);
  const setIsExpanded = useAppStore((state) => state.setSidebarExpanded);

  const isItemEnabled = (item: NavItem): boolean => {
    switch (item.enabledWhen) {
      case "always":
        return true;
      case "hasCandidates":
        return hasCandidates;
      case "hasAnalysis":
        return hasAnalysis;
      default:
        return false;
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ease-out",
        isExpanded ? "w-[200px]" : "w-[60px]"
      )}
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const enabled = isItemEnabled(item);
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => enabled && onTabChange(item.id)}
                  disabled={!enabled}
                  className={cn(
                    "flex items-center w-full rounded-lg transition-all duration-150",
                    isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                    enabled
                      ? isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isExpanded ? "mr-3" : ""
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-all duration-200",
                      isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Expand/Collapse Toggle */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs ml-1">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
