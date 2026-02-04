import { FileText, Search, Loader2, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "file-text" | "search" | "loader" | "users" | "message";
  className?: string;
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
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
        <Icon className={cn("h-8 w-8", icon === "loader" && "animate-spin")} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
