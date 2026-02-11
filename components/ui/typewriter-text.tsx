"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Characters per second
  delay?: number; // Delay before starting in ms
  className?: string;
  onComplete?: () => void;
  skipOnClick?: boolean;
  renderMarkdown?: boolean;
}

export function TypewriterText({
  text,
  speed = 100,
  delay = 0,
  className,
  onComplete,
  skipOnClick = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const completeAnimation = useCallback(() => {
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setIsComplete(false);
    setHasStarted(false);

    // Delay before starting
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted || isComplete) return;

    const interval = 1000 / speed;
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        // Add multiple characters per tick for faster display
        const charsToAdd = Math.min(3, text.length - currentIndex);
        setDisplayedText(text.slice(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, speed, hasStarted, isComplete, onComplete]);

  const handleClick = () => {
    if (skipOnClick && !isComplete) {
      completeAnimation();
    }
  };

  // Render with basic inline markdown support (bold, italic)
  const renderWithMarkdown = (content: string) => {
    // Split on **bold** and *italic* patterns
    const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <span
      className={cn("inline", className)}
      onClick={handleClick}
      style={{ cursor: skipOnClick && !isComplete ? "pointer" : "default" }}
    >
      {renderWithMarkdown(displayedText)}
      {!isComplete && hasStarted && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary/70 animate-pulse align-middle" />
      )}
    </span>
  );
}

// For multi-line text with preserved formatting
interface TypewriterParagraphProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterParagraph({
  text,
  speed = 150,
  delay = 0,
  className,
  onComplete,
}: TypewriterParagraphProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    setHasStarted(false);

    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted || isComplete) return;

    const interval = 1000 / speed;
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        const charsToAdd = Math.min(5, text.length - currentIndex);
        setDisplayedText(text.slice(0, currentIndex + charsToAdd));
        currentIndex += charsToAdd;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, speed, hasStarted, isComplete, onComplete]);

  const handleClick = () => {
    if (!isComplete) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
    }
  };

  // Render with inline markdown
  const renderWithMarkdown = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className={cn("whitespace-pre-wrap", className)}
      onClick={handleClick}
      style={{ cursor: !isComplete ? "pointer" : "default" }}
    >
      {renderWithMarkdown(displayedText)}
      {!isComplete && hasStarted && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary/70 animate-pulse align-middle" />
      )}
    </div>
  );
}

// For bullet point lists with staggered animation
interface TypewriterListProps {
  items: string[];
  speed?: number;
  staggerDelay?: number; // Delay between each item
  initialDelay?: number;
  className?: string;
  bulletClassName?: string;
  itemClassName?: string;
  renderBullet?: (index: number) => React.ReactNode;
}

export function TypewriterList({
  items,
  speed = 120,
  staggerDelay = 200,
  initialDelay = 0,
  className,
  bulletClassName,
  itemClassName,
  renderBullet,
}: TypewriterListProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    setVisibleItems([]);
    
    items.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
      }, initialDelay + index * staggerDelay);
      
      return () => clearTimeout(timer);
    });
  }, [items, initialDelay, staggerDelay]);

  return (
    <ul className={cn("space-y-1.5", className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className={cn(
            "flex items-start gap-2 transition-opacity duration-200",
            visibleItems.includes(index) ? "opacity-100" : "opacity-0"
          )}
        >
          {renderBullet ? (
            renderBullet(index)
          ) : (
            <span className={cn("mt-1.5", bulletClassName)}>•</span>
          )}
          <span className={itemClassName}>
            {visibleItems.includes(index) && (
              <TypewriterText
                text={item}
                speed={speed}
                delay={0}
              />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
