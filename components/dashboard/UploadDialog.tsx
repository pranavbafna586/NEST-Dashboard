"use client";

import React, { useState, useRef } from "react";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProcessingStep =
  | "idle"
  | "uploading"
  | "validating"
  | "renaming"
  | "importing"
  | "complete"
  | "error";

const REQUIRED_FILE_COUNT = 9;

export default function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [".xlsx", ".xls", ".xlsm"];

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return (
        acceptedFileTypes.includes(extension) ||
        acceptedFileTypes.includes(file.type)
      );
    });

    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Validate file count
      if (selectedFiles.length !== REQUIRED_FILE_COUNT) {
        setError(`Please select exactly ${REQUIRED_FILE_COUNT} Excel files`);
        return;
      }

      setFiles(selectedFiles);
      setError("");
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length !== REQUIRED_FILE_COUNT) {
      setError(`Please upload exactly ${REQUIRED_FILE_COUNT} files`);
      return;
    }

    try {
      // Step 1: Upload files to temp directory
      setCurrentStep("uploading");
      setProgress(10);
      setStatusMessage("Uploading files to server...");

      console.log("Starting file upload...");
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const uploadResponse = await fetch("/api/save-files", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", errorText);
        throw new Error(`Failed to upload files: ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData);
      const { folderPath } = uploadData;
      setProgress(20);

      // Step 2: Validate with Gemini AI
      setCurrentStep("validating");
      setProgress(30);
      setStatusMessage(
        "Validating files with AI (checking structure and naming)...",
      );

      console.log("Starting validation...", folderPath);
      const validateResponse = await fetch("/api/validate-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath }),
      });

      if (!validateResponse.ok) {
        const errorText = await validateResponse.text();
        console.error("Validation failed:", errorText);
        throw new Error(`Validation failed: ${errorText}`);
      }

      const validationResult = await validateResponse.json();
      console.log("Validation result:", validationResult);
      setProgress(50);

      // Step 3: Rename files
      setCurrentStep("renaming");
      setProgress(60);
      setStatusMessage("Renaming files to standard format...");

      console.log("Starting rename...");
      const renameResponse = await fetch("/api/rename-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath, validationResult }),
      });

      if (!renameResponse.ok) {
        const errorText = await renameResponse.text();
        console.error("Rename failed:", errorText);
        throw new Error(`Renaming failed: ${errorText}`);
      }

      const renameData = await renameResponse.json();
      console.log("Rename response:", renameData);
      const { newFolderPath } = renameData;
      setProgress(75);

      // Step 4: Import to database
      setCurrentStep("importing");
      setProgress(70);
      setStatusMessage("Closing existing database connections...");

      console.log("Starting database import...");

      // Simulate progress updates for import substeps
      setTimeout(
        () => setStatusMessage("Checking Python installation..."),
        500,
      );
      setTimeout(() => {
        setProgress(75);
        setStatusMessage("Installing Python dependencies...");
      }, 1000);
      setTimeout(() => {
        setProgress(80);
        setStatusMessage("Creating/verifying database schema...");
      }, 1500);
      setTimeout(() => {
        setProgress(85);
        setStatusMessage("Copying files to Study Files directory...");
      }, 2000);
      setTimeout(() => {
        setProgress(90);
        setStatusMessage("Extracting and processing Excel data...");
      }, 2500);
      setTimeout(() => {
        setProgress(95);
        setStatusMessage("Inserting data into database...");
      }, 3000);
      const importResponse = await fetch("/api/import-to-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: newFolderPath }),
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        console.error("Import failed:", errorText);
        throw new Error(`Database import failed: ${errorText}`);
      }

      const importResult = await importResponse.json();
      console.log("Import result:", importResult);
      setProgress(100);
      setStatusMessage("Import complete! Reloading dashboard...");

      setCurrentStep("complete");

      // Reload the page after 2 seconds to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentStep("error");
    }
  };

  const handleClose = () => {
    setFiles([]);
    setCurrentStep("idle");
    setProgress(0);
    setError("");
    setStatusMessage("");
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return (
        <svg
          className="w-8 h-8 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
        </svg>
      );
    } else if (["xlsx", "xls"].includes(extension || "")) {
      return (
        <svg
          className="w-8 h-8 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
        </svg>
      );
    } else if (extension === "csv") {
      return (
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
        </svg>
      );
    }

    return (
      <svg
        className="w-8 h-8 text-gray-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
      </svg>
    );
  };

  if (!isOpen) return null;

  console.log("UploadDialog rendering - isOpen:", isOpen);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md bg-white/30">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Excel Files
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload exactly {REQUIRED_FILE_COUNT} Excel files for validation
              and import
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={
              currentStep !== "idle" &&
              currentStep !== "complete" &&
              currentStep !== "error"
            }
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <div className="flex flex-col items-center">
              <svg
                className={`w-16 h-16 mb-4 ${
                  isDragging ? "text-blue-500" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: XLSX, XLS, XLSM - Exactly{" "}
                {REQUIRED_FILE_COUNT} files required
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors ml-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(currentStep === "uploading" ||
            currentStep === "validating" ||
            currentStep === "renaming" ||
            currentStep === "importing") && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 animate-spin mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Processing...
                  </p>
                  <p className="text-sm text-blue-700">{statusMessage}</p>
                  <div className="mt-3 bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 text-right">
                    {progress}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {currentStep === "complete" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Import Complete!
                  </p>
                  <p className="text-sm text-green-700">
                    Dashboard will reload automatically...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && currentStep === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Error
                  </p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {files.length === 0
              ? `No files selected (need ${REQUIRED_FILE_COUNT})`
              : files.length === REQUIRED_FILE_COUNT
                ? `${files.length} files ready - Good to go!`
                : `${files.length} files selected - Need exactly ${REQUIRED_FILE_COUNT}`}
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              disabled={
                currentStep !== "idle" &&
                currentStep !== "complete" &&
                currentStep !== "error"
              }
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={
                files.length !== REQUIRED_FILE_COUNT ||
                currentStep === "uploading" ||
                currentStep === "validating" ||
                currentStep === "renaming" ||
                currentStep === "importing"
              }
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                files.length !== REQUIRED_FILE_COUNT ||
                currentStep === "uploading" ||
                currentStep === "validating" ||
                currentStep === "renaming" ||
                currentStep === "importing"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              {currentStep === "idle" || currentStep === "error"
                ? `Upload ${files.length > 0 ? `(${files.length})` : ""}`
                : "Processing..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for processing step indicator
function ProcessingStepIndicator({
  title,
  isActive,
  isComplete,
}: {
  title: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {isComplete ? (
        <svg
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          />
        </svg>
      ) : isActive ? (
        <svg
          className="w-5 h-5 text-blue-600 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span
        className={`text-sm ${isActive ? "text-blue-700 font-medium" : isComplete ? "text-green-700" : "text-gray-600"}`}
      >
        {title}
      </span>
    </div>
  );
}
