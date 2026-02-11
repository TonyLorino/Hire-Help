"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in ms before animation starts
  duration?: number; // Duration of border draw in ms
  onAnimationComplete?: () => void;
  skipAnimation?: boolean; // Skip animation entirely (for already-loaded content)
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  duration = 600,
  onAnimationComplete,
  skipAnimation = false,
}: AnimatedCardProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(skipAnimation);
  const [isBorderHidden, setIsBorderHidden] = useState(skipAnimation);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If skipping animation, don't run any timers
    if (skipAnimation) {
      setIsContentVisible(true);
      setIsBorderHidden(true);
      onAnimationComplete?.();
      return;
    }

    // Measure the container
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }

    // Start drawing after delay
    const drawTimer = setTimeout(() => {
      setIsDrawing(true);
    }, delay);

    // Show content after border animation completes
    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
      onAnimationComplete?.();
    }, delay + duration);

    // Hide border after content is visible (fade out the border)
    const hideBorderTimer = setTimeout(() => {
      setIsBorderHidden(true);
    }, delay + duration + 300);

    return () => {
      clearTimeout(drawTimer);
      clearTimeout(contentTimer);
      clearTimeout(hideBorderTimer);
    };
  }, [delay, duration, onAnimationComplete, skipAnimation]);

  // Calculate perimeter for stroke-dasharray
  const perimeter = 2 * (dimensions.width + dimensions.height);
  const cornerRadius = 12; // Match rounded-apple

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-apple bg-white",
        className
      )}
    >
      {/* SVG Border Animation - hidden after animation completes */}
      {!isBorderHidden && (
        <svg
          className={cn(
            "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300",
            isContentVisible ? "opacity-0" : "opacity-100"
          )}
          style={{ zIndex: 10 }}
        >
          <rect
            x="1"
            y="1"
            width={dimensions.width ? dimensions.width - 2 : "100%"}
            height={dimensions.height ? dimensions.height - 2 : "100%"}
            rx={cornerRadius}
            ry={cornerRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/60"
            style={{
              strokeDasharray: perimeter,
              strokeDashoffset: isDrawing ? 0 : perimeter,
              transition: isDrawing ? `stroke-dashoffset ${duration}ms ease-out` : "none",
            }}
          />
        </svg>
      )}

      {/* Content with fade-in */}
      <div
        className={cn(
          "relative",
          skipAnimation ? "" : "transition-all duration-300",
          isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        {children}
      </div>

      {/* Subtle shadow that appears after animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-apple shadow-sm pointer-events-none",
          skipAnimation ? "opacity-100" : "transition-opacity duration-500",
          isContentVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ zIndex: -1 }}
      />
    </div>
  );
}

// Skeleton version for loading states
export function AnimatedCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-apple bg-gray-50 border-2 border-gray-200 animate-pulse",
        className
      )}
    >
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
