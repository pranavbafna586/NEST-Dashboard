/**
 * Type Definitions for Excel Upload Pipeline
 * Consolidates all types used across the pipeline
 */

// ==================== Excel Analysis Types ====================

export interface ColumnInfo {
  name: string;
  type: "string" | "number" | "date";
  sampleValues: any[];
}

export interface SheetInfo {
  sheetName: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ExcelFileStructure {
  fileName: string;
  sheets: SheetInfo[];
  fileSize: number;
  uploadedAt: string;
}

// ==================== Expected Structure Types ====================

export interface ExpectedFileStructure {
  expectedFileName: string;
  description: string;
  expectedSheets?: {
    sheetName: string;
    requiredColumns: string[];
  }[];
}

export interface ValidationResult {
  isValid: boolean;
  fileCount: number;
  expectedCount: number;
  missingFiles: string[];
  extraFiles: string[];
  fileMatches: {
    uploadedFile: string;
    matchedExpectedFile: string | null;
    confidence: number;
  }[];
}

// ==================== Gemini Mapping Types ====================

export interface ColumnMappingInstruction {
  uploadedColumnName: string;
  standardColumnName: string;
  requiresRename: boolean;
}

export interface SheetMappingInstruction {
  uploadedSheetName: string;
  standardSheetName: string;
  columnMappings: ColumnMappingInstruction[];
}

export interface FileMappingInstruction {
  uploadedFileName: string;
  standardFileName: string;
  confidence: number;
  sheetMappings: SheetMappingInstruction[];
}

export interface GeminiMappingResponse {
  success: boolean;
  fileMappings: FileMappingInstruction[];
  summary: string;
  errors?: string[];
}

// ==================== Rename Types ====================

export interface RenameResult {
  success: boolean;
  originalFileName: string;
  newFileName: string;
  renamedFile: File;
  sheetsRenamed: number;
  columnsRenamed: number;
  errors: string[];
}

// ==================== Pipeline State Types ====================

export type ProcessingStep =
  | "idle"
  | "uploading"
  | "analyzing"
  | "mapping"
  | "renaming"
  | "saving"
  | "complete"
  | "error";

export interface PipelineState {
  currentStep: ProcessingStep;
  progress: number;
  files: File[];
  uploadedStructures: ExcelFileStructure[];
  mappingResponse: GeminiMappingResponse | null;
  renameResults: RenameResult[];
  error: string;
}

// ==================== API Response Types ====================

export interface SaveFilesResponse {
  success: boolean;
  savedFiles: string[];
  outputPath: string;
  errors: string[];
}

export interface GeminiAPIRequest {
  prompt: string;
  uploadedStructures: ExcelFileStructure[];
}

// ==================== Constants ====================

export const REQUIRED_FILE_COUNT = 9;

export const ALLOWED_FILE_EXTENSIONS = [".xlsx", ".xls", ".xlsm"];

export const PROCESSING_STEPS: {
  step: ProcessingStep;
  title: string;
  description: string;
}[] = [
  {
    step: "uploading",
    title: "File Upload",
    description: "Selecting and validating files",
  },
  {
    step: "analyzing",
    title: "Analyzing Files",
    description: "Extracting structure, sheets, and columns",
  },
  {
    step: "mapping",
    title: "AI Mapping",
    description: "Using Gemini to match files and columns",
  },
  {
    step: "renaming",
    title: "Renaming",
    description: "Standardizing file and column names",
  },
  {
    step: "saving",
    title: "Saving",
    description: "Saving standardized files to server",
  },
  {
    step: "complete",
    title: "Complete",
    description: "Processing completed successfully",
  },
];
