import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function isValidFileType(filename: string): boolean {
  const validExtensions = ["pdf", "docx", "doc", "txt"];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getRankingColor(ranking: string): string {
  switch (ranking.toLowerCase()) {
    case "best":
      return "text-success bg-success-light";
    case "better":
      return "text-primary bg-primary-50";
    case "good":
      return "text-warning bg-warning-light";
    case "bad":
      return "text-danger bg-danger-light";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation.toLowerCase()) {
    case "concentrate":
      return "text-success bg-success-light";
    case "consider":
      return "text-warning bg-warning-light";
    case "eliminate":
      return "text-danger bg-danger-light";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getDecisionColor(decision: string): string {
  switch (decision.toLowerCase()) {
    case "advance":
      return "text-success bg-success-light";
    case "hold":
      return "text-warning bg-warning-light";
    case "reject":
      return "text-danger bg-danger-light";
    default:
      return "text-gray-600 bg-gray-100";
  }
}
