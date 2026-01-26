import { ExcelFileStructure } from "./excel-analyzer";
import {
  generateExpectedStructureText,
  EXPECTED_FILES,
  STRUCTURE_STATS,
} from "./expected-structure";

const REQUIRED_FILE_COUNT = STRUCTURE_STATS.totalFiles;

export interface FileMappingInstruction {
  uploadedFileName: string;
  standardFileName: string;
  confidence: number;
  sheetMappings: SheetMappingInstruction[];
}

export interface SheetMappingInstruction {
  uploadedSheetName: string;
  standardSheetName: string;
  columnMappings: ColumnMappingInstruction[];
}

export interface ColumnMappingInstruction {
  uploadedColumnName: string;
  standardColumnName: string;
  requiresRename: boolean;
}

export interface GeminiMappingResponse {
  success: boolean;
  fileMappings: FileMappingInstruction[];
  summary: string;
  errors?: string[];
}

/**
 * Generate comprehensive prompt for Gemini to map uploaded files to expected structure
 */
export function generateGeminiMappingPrompt(
  uploadedStructures: ExcelFileStructure[],
): string {
  const expectedStructure = generateExpectedStructureText();
  const uploadedStructure =
    generateUploadedStructureSummary(uploadedStructures);

  return `You are an expert data analyst helping to standardize Excel file uploads for a clinical trial study.

${expectedStructure}

${uploadedStructure}

TASK:
Analyze the uploaded files and map them to the expected structure. For each uploaded file:

1. FILE MATCHING - Match uploaded files to expected files based on:
   - File name similarity (ignore prefixes like "Study 1_", suffixes like "_updated", dates, etc.)
   - Sheet names and structure
   - Column names and patterns

2. SHEET MATCHING - For each file, match uploaded sheets to expected sheets:
   - Compare sheet names (be lenient with spacing, capitalization, special characters)
   - If sheet names don't match exactly, look at column patterns to identify the correct sheet
   - ALL expected sheets MUST be mapped (even if sheet names are different in uploaded file)

3. COLUMN MATCHING - For each sheet, map uploaded columns to expected columns:
   - Match column names even if they have slight variations
   - Standardize column names to match the expected format EXACTLY
   - Handle special characters: trailing spaces, newlines (\\n or \\r\\n), forward slashes (/)
   - Examples of edge cases to match:
     * "Form " (trailing space) should match "Form"
     * "Data on Form/\\nRecord" (with newline) should match as-is with the newline character
     * "Date page entered/ Date last PI Sign" (with /) should match exactly
   - For multi-row headers, expect hierarchical names with " - " separator like:
     * "CPMD - Page status - # Pages Entered"
     * "Input files - Missing Visits"
   - Mark requiresRename=true if the column name doesn't match exactly (including whitespace)
   - ALL expected columns should be mapped if they exist in the uploaded file

4. Provide mapping instructions in the following JSON format:

{
  "success": true,
  "fileMappings": [
    {
      "uploadedFileName": "Study 1_CPID_EDC_Metrics_URSV2.0_14 NOV 2025_updated.xlsx",
      "standardFileName": "CPID_EDC_Metrics.xlsx",
      "confidence": 0.95,
      "sheetMappings": [
        {
          "uploadedSheetName": "Subject Level Metrics",
          "standardSheetName": "Subject Level Metrics",
          "columnMappings": [
            {
              "uploadedColumnName": "Project Name",
              "standardColumnName": "Project Name",
              "requiresRename": false
            },
            {
              "uploadedColumnName": "Site ID",
              "standardColumnName": "Site ID",
              "requiresRename": false
            }
          ]
        }
      ]
    }
  ],
  "summary": "Successfully mapped all 9 files with ${REQUIRED_FILE_COUNT} total sheets. Column name standardization recommended for consistency.",
  "errors": []
}

IMPORTANT RULES:
- All ${REQUIRED_FILE_COUNT} uploaded files MUST be mapped to the expected files
- Each expected sheet MUST be found in the uploaded file (sheet names may vary)
- Map ALL columns that exist in both uploaded and expected sheets
- Column name mappings should preserve the expected column names exactly as specified
- Confidence score should be between 0 and 1 (0.9+ for strong matches, 0.5-0.9 for moderate, <0.5 for weak)
- If a file cannot be confidently matched, set confidence < 0.5 and explain in errors array
- Sheet names should match the expected sheet names exactly in the standardSheetName field
- For columnMappings, include ALL columns from the expected structure that exist in the uploaded file
- Set requiresRename=false if column names match exactly, true if they differ
- Be lenient with file names that have prefixes, suffixes, dates, or version numbers

Return ONLY the JSON response, no additional text.`;
}

/**
 * Generate uploaded structure summary for the prompt
 */
function generateUploadedStructureSummary(
  structures: ExcelFileStructure[],
): string {
  let text = "=== UPLOADED FILES (USER PROVIDED) ===\n\n";
  text += `Total Uploaded Files: ${structures.length}\n\n`;

  structures.forEach((structure, index) => {
    text += `${index + 1}. ${structure.fileName}\n`;
    text += `   Number of Sheets: ${structure.sheets.length}\n`;
    structure.sheets.forEach((sheet, sheetIndex) => {
      text += `     ${sheetIndex + 1}. ${sheet.sheetName} (${sheet.columns.length} columns, ${sheet.rowCount} rows)\n`;
      text += `        Columns:\n`;
      sheet.columns.forEach((col, colIndex) => {
        text += `          ${colIndex + 1}. ${col.name} (${col.type})`;
        if (col.sampleValues.length > 0) {
          text += ` - Sample: ${col.sampleValues.slice(0, 2).join(", ")}`;
        }
        text += "\n";
      });
    });
    text += "\n";
  });

  return text;
}

/**
 * Call Gemini API to get file mapping instructions
 */
export async function getFileMappingFromGemini(
  uploadedStructures: ExcelFileStructure[],
): Promise<GeminiMappingResponse> {
  try {
    const prompt = generateGeminiMappingPrompt(uploadedStructures);

    const response = await fetch("/api/gemini-mapping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        uploadedStructures,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      success: false,
      fileMappings: [],
      summary: "Failed to get mapping from Gemini",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Save mapping instructions to text file
 */
export function saveMappingToFile(
  mapping: GeminiMappingResponse,
  filename: string = "file_mapping_instructions.txt",
): void {
  let text = "=== FILE MAPPING INSTRUCTIONS ===\n\n";
  text += `Summary: ${mapping.summary}\n\n`;

  if (mapping.errors && mapping.errors.length > 0) {
    text += "ERRORS:\n";
    mapping.errors.forEach((error) => {
      text += `  - ${error}\n`;
    });
    text += "\n";
  }

  mapping.fileMappings.forEach((fileMapping, index) => {
    text += `\n${index + 1}. FILE MAPPING\n`;
    text += `   Uploaded: ${fileMapping.uploadedFileName}\n`;
    text += `   Standard: ${fileMapping.standardFileName}\n`;
    text += `   Confidence: ${(fileMapping.confidence * 100).toFixed(1)}%\n\n`;

    fileMapping.sheetMappings.forEach((sheetMapping, sheetIndex) => {
      text += `   Sheet ${sheetIndex + 1}:\n`;
      text += `     Uploaded: ${sheetMapping.uploadedSheetName}\n`;
      text += `     Standard: ${sheetMapping.standardSheetName}\n`;

      if (sheetMapping.columnMappings.length > 0) {
        text += `     Column Mappings:\n`;
        sheetMapping.columnMappings.forEach((colMapping) => {
          const status = colMapping.requiresRename ? "→" : "✓";
          text += `       ${status} ${colMapping.uploadedColumnName}`;
          if (colMapping.requiresRename) {
            text += ` → ${colMapping.standardColumnName}`;
          }
          text += "\n";
        });
      }
      text += "\n";
    });

    text += "\n" + "-".repeat(60) + "\n";
  });

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
