"use client";

import { useState, useRef } from "react";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

const REQUIRED_FILE_COUNT = 9;

type ProcessingStep =
  | "idle"
  | "uploading"
  | "validating"
  | "renaming"
  | "importing"
  | "calculating"
  | "complete"
  | "error";

export default function ExcelUploadPipeline() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("idle");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file count
    if (selectedFiles.length !== REQUIRED_FILE_COUNT) {
      setError(`Please upload exactly ${REQUIRED_FILE_COUNT} Excel files`);
      setFiles([]);
      return;
    }

    // Validate file types (only Excel files)
    const invalidFiles = selectedFiles.filter(
      (file) =>
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls") &&
        !file.name.endsWith(".xlsm"),
    );

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file types detected: ${invalidFiles.map((f) => f.name).join(", ")}. Only Excel files are allowed.`,
      );
      return;
    }

    setFiles(selectedFiles);
    setError("");
    setCurrentStep("uploading");
  };

  const processFiles = async () => {
    if (files.length !== REQUIRED_FILE_COUNT) {
      setError(`Please upload exactly ${REQUIRED_FILE_COUNT} files`);
      return;
    }

    try {
      // Step 1: Upload files to temp directory
      setCurrentStep("uploading");
      setProgress(10);

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
      setProgress(80);

      console.log("Starting database import...");
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
      setProgress(85);

      // Step 5: Calculate DQI and Clean Status
      setCurrentStep("calculating");
      setProgress(90);

      // Wait for DQI calculations (they're done by main.py)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(100);

      setCurrentStep("complete");
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setCurrentStep("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setCurrentStep("idle");
    setError("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStepStatus = (step: ProcessingStep) => {
    const steps: ProcessingStep[] = [
      "uploading",
      "validating",
      "renaming",
      "importing",
      "calculating",
    ];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (currentIndex === -1) {
      return "pending";
    }

    if (currentStep === "error") {
      return stepIndex <= currentIndex ? "error" : "pending";
    }

    if (currentStep === "complete") {
      return "complete";
    }

    if (stepIndex < currentIndex) {
      return "complete";
    } else if (stepIndex === currentIndex) {
      return "active";
    } else {
      return "pending";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">Excel File Upload Pipeline</h2>
        <p className="text-gray-600">
          Upload exactly {REQUIRED_FILE_COUNT} Excel files for standardization
          and processing
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">File Upload</h3>
          <span className="text-sm text-gray-500">
            {files.length} / {REQUIRED_FILE_COUNT} files
          </span>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.xlsm"
            onChange={handleFileSelection}
            className="hidden"
            id="file-upload"
            disabled={currentStep !== "idle" && currentStep !== "uploading"}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Excel files (.xlsx, .xls, .xlsm) - Exactly {REQUIRED_FILE_COUNT}{" "}
              files required
            </p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              Selected Files:
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {files.length === REQUIRED_FILE_COUNT &&
          currentStep === "uploading" &&
          !error && (
            <button
              onClick={processFiles}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Start Processing
            </button>
          )}
      </div>

      {/* Processing Steps */}
      {currentStep !== "idle" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Pipeline</h3>

          <div className="space-y-4">
            {/* Step 1: Validating */}
            <ProcessingStepCard
              title="1. Validating Files with AI"
              description="Using Gemini AI to validate file structure and generate rename mappings"
              status={getStepStatus("validating")}
            />

            {/* Step 2: Renaming */}
            <ProcessingStepCard
              title="2. Renaming Files"
              description="Standardizing file names based on AI recommendations"
              status={getStepStatus("renaming")}
            />

            {/* Step 3: Importing */}
            <ProcessingStepCard
              title="3. Importing to Database"
              description="Creating database schema and importing Excel data"
              status={getStepStatus("importing")}
            />

            {/* Step 4: Calculate DQI and Clean Status */}
            <ProcessingStepCard
              title="4. Calculating DQI & Clean Status"
              description="Computing Data Quality Index and patient clean status metrics"
              status={getStepStatus("calculating")}
            />
          </div>

          {/* Progress Bar */}
          {currentStep !== "complete" && currentStep !== "error" && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {progress}% Complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {currentStep === "complete" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-700">
              Processing Complete!
            </h3>
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-medium text-green-800 mb-2">Summary:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ {files.length} files uploaded and validated</li>
                <li>✓ Files renamed and standardized</li>
                <li>✓ Database created and data imported successfully</li>
                <li>✓ Dashboard is ready to view!</li>
              </ul>
            </div>

            <div className="flex gap-3 mt-4">
              <a
                href="/dashboard"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                View Dashboard
              </a>
              <button
                onClick={reset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Upload New Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for processing steps
function ProcessingStepCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "pending" | "active" | "complete" | "error";
}) {
  const getIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "active":
        return <AlertCircle className="w-5 h-5 text-blue-600 animate-pulse" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "complete":
        return "bg-green-50 border-green-200";
      case "active":
        return "bg-blue-50 border-blue-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
