"use client";

import { useState, useRef } from "react";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAppStore } from "@/store/app-store";
import { cn, generateId, isValidFileType } from "@/lib/utils";

export function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const jobDescription = useAppStore((state) => state.jobDescription);
  const addCandidate = useAppStore((state) => state.addCandidate);
  const candidates = useAppStore((state) => state.candidates);
  const setAnalysisResults = useAppStore((state) => state.setAnalysisResults);

  const processFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter((f) =>
      isValidFileType(f.name)
    );

    if (validFiles.length === 0) {
      alert("Please upload PDF or Word documents");
      return;
    }

    setIsUploading(true);
    setUploadProgress([]);

    try {
      for (const file of validFiles) {
        setUploadProgress((prev) => [...prev, `Processing ${file.name}...`]);
        
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to parse ${file.name}`);
        }

        const { text, candidateName, location } = await response.json();

        // Generate consistent fallback name if extraction failed
        const currentCandidates = useAppStore.getState().candidates;
        const candidateNumber = currentCandidates.length + 1;
        const name = (candidateName && candidateName !== "Unknown Candidate") 
          ? candidateName 
          : `Candidate ${candidateNumber}`;

        addCandidate({
          id: generateId(),
          name,
          location,
          resumeText: text,
          fileName: file.name,
          uploadedAt: new Date(),
        });

        setUploadProgress((prev) => [
          ...prev.slice(0, -1),
          `✓ ${name} added`,
        ]);
      }

      // Trigger analysis if we have JD and candidates
      if (jobDescription) {
        setUploadProgress((prev) => [...prev, "Analyzing candidates..."]);
        await analyzeResumes();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress((prev) => [...prev, "Error processing files"]);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress([]), 2000);
    }
  };

  const analyzeResumes = async () => {
    const currentCandidates = useAppStore.getState().candidates;
    const jd = useAppStore.getState().jobDescription;
    
    if (!jd || currentCandidates.length === 0) return;

    try {
      const response = await fetch("/api/analyze-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jd,
          resumes: currentCandidates.map((c) => ({
            id: c.id,
            name: c.name,
            text: c.resumeText,
          })),
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
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
    <Card
      className={cn(
        "border-dashed border-2 transition-all duration-300 bg-white dark:bg-gray-800",
        isDragging
          ? "border-primary bg-primary/5"
          : jobDescription
          ? "border-gray-200 dark:border-gray-600 hover:border-primary/50"
          : "border-gray-200 dark:border-gray-600 opacity-50"
      )}
    >
      <CardContent className="p-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="text-center py-6"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={!jobDescription || isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <Spinner className="mx-auto" />
              <div className="space-y-1">
                {uploadProgress.map((msg, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={cn(
                "flex h-12 w-12 mx-auto items-center justify-center rounded-full mb-3 transition-transform",
                jobDescription 
                  ? "bg-primary/10 text-primary hover:scale-105" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              )}>
                <FileUp className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {jobDescription
                  ? "Upload candidate resumes"
                  : "Upload a job description first"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PDF, Word, or text files
              </p>
              {!jobDescription && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  Upload a job description on the left first
                </p>
              )}
              {jobDescription && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  Drag and drop or click to select multiple files
                </p>
              )}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!jobDescription}
                variant={jobDescription ? "default" : "outline"}
                size="sm"
                className="mt-4"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
