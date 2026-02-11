import { FileText, Search, Loader2, Users, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "file-text" | "search" | "loader" | "users" | "message";
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
  secondaryText?: string;
  actionLabel?: string;
  onAction?: () => void;
  showArrow?: "left" | "right" | "up" | "down";
  highlight?: boolean;
}

const icons = {
  "file-text": FileText,
  search: Search,
  loader: Loader2,
  users: Users,
  message: MessageSquare,
};

export function EmptyState({
  title,
  description,
  icon = "file-text",
  className,
  stepNumber,
  totalSteps,
  secondaryText,
  actionLabel,
  onAction,
  showArrow,
  highlight = false,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12",
        className
      )}
    >
      {/* Step indicator */}
      {stepNumber && totalSteps && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
      )}

      {/* Arrow pointer */}
      {showArrow === "left" && (
        <div className="flex items-center gap-2 mb-4 animate-point-left">
          <ArrowLeft className="h-5 w-5 text-primary" />
          <span className="text-sm text-primary font-medium">Start here</span>
        </div>
      )}

      {/* Icon with optional highlight */}
      <div 
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4",
          highlight && "ring-2 ring-primary/30 ring-offset-2 animate-highlight-pulse",
          icon !== "loader" && "transition-transform hover:scale-105"
        )}
      >
        <Icon className={cn("h-8 w-8", icon === "loader" && "animate-spin")} />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      
      {/* Secondary helper text */}
      {secondaryText && (
        <p className="text-xs text-gray-400 mt-2 max-w-xs">{secondaryText}</p>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          variant="outline"
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
