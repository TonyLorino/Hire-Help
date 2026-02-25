"use client";

import { useState, useRef } from "react";
import { FileText, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "@/store/app-store";
import { cn, isValidFileType } from "@/lib/utils";

export function JDUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setJobDescription = useAppStore((state) => state.setJobDescription);

  const processFile = async (file: File) => {
    if (!isValidFileType(file.name)) {
      alert("Please upload a PDF, Word, or text file");
      return;
    }

    setIsUploading(true);
    setStatusMessage(`Processing ${file.name}...`);

    try {
      // For text files, read directly and auto-submit
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const content = await file.text();
        setStatusMessage("Extracting job information...");
        
        // Call parse-jd API to extract job info even for text files
        const response = await fetch("/api/parse-jd", {
          method: "POST",
          body: createFormData(file),
        });

        if (response.ok) {
          const { text: parsedText, jobInfo } = await response.json();
          setStatusMessage(`✓ ${jobInfo.jobTitle || "Job Description"} loaded`);
          // Auto-submit
          setJobDescription(parsedText, jobInfo);
        } else {
          // Fallback: just use the text
          setJobDescription(content);
        }
      } else {
        // For PDF/DOCX, use the parse-jd API
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-jd", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse file");
        }

        const { text: parsedText, jobInfo } = await response.json();
        setStatusMessage(`✓ ${jobInfo.jobTitle || "Job Description"} loaded`);
        
        // Auto-submit with job info
        setJobDescription(parsedText, jobInfo);
      }
    } catch (error) {
      console.error("File processing error:", error);
      setStatusMessage("Error processing file");
      alert("Failed to process file. Please try a different file format.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  const createFormData = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return formData;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-600 hover:border-primary/50 bg-white dark:bg-gray-800 transition-colors">
      <CardContent className="p-4">
        <div
          className={cn(
            "transition-colors rounded-lg",
            isDragging && "bg-primary/5"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {/* Upload area */}
          <div className="flex flex-col items-center text-center py-4">
            {isUploading ? (
              <>
                <Spinner className="mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{statusMessage}</p>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 transition-transform hover:scale-105">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Upload job description
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PDF, Word, or text file
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  Drag and drop or click to select
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3"
                  disabled={isUploading}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
