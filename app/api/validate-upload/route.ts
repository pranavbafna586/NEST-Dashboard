/**
 * Validate Upload API Endpoint
 * 
 * PURPOSE:
 * Validates uploaded Excel files before import by checking file names, sheet names,
 * and column structures against expected database schema. Step 2 in upload workflow.
 * 
 * BUSINESS CONTEXT - Why Validation Matters:
 * Excel files from different sources often have inconsistent naming:
 * - "Study1_SAE_Report.xlsx" vs "SAE_issues_2024.xlsx" (both are SAE data)
 * - "Compiled_EDRR.xlsx" vs "EDRR_Report_Final.xlsx" (both are EDRR data)
 * - Missing files (user forgot to upload signature compliance report)
 * - Wrong file structures (exported wrong query from database)
 * 
 * Validation prevents:
 * - Import failures due to unexpected file names
 * - Data corruption from wrong file mappings
 * - Missing critical data undetected until dashboard loads
 * - Time wasted debugging import errors
 * 
 * VALIDATION CHECKS:
 * 
 * 1. **File Name Recognition**:
 *    - Does file name match expected pattern?
 *    - Example: "SAE" or "eSAE" in name → sae_issues table
 *    - Example: "Query" or "QC" in name → query_report table
 * 
 * 2. **Sheet Name Validation**:
 *    - Does Excel file have expected sheet names?
 *    - Example: SAE file should have "eSAE" or "SAE Issues" sheet
 * 
 * 3. **Column Structure Check**:
 *    - Do sheets have required columns?
 *    - Example: query_report needs: project_name, site_id, subject_id, query_id
 * 
 * 4. **Completeness Check**:
 *    - Are all required files present?
 *    - Missing files flagged for user attention
 * 
 * VALIDATION RESULT:
 * ```json
 * {
 *   "success": true,
 *   "validation": {
 *     "validFiles": [
 *       { "filename": "Study_1_SAE_Report.xlsx", "mapping": "sae_issues", "confidence": "high" }
 *     ],
 *     "invalidFiles": [
 *       { "filename": "Unknown_Data_123.xlsx", "reason": "Could not map to any expected table" }
 *     ],
 *     "missingFiles": ["protocol_deviation"],
 *     "suggestions": [
 *       { "from": "Study1_SAE.xlsx", "to": "Study 1_SAE_Report.xlsx" }
 *     ]
 *   }
 * }
 * ```
 * 
 * WORKFLOW POSITION:
 * 1. /api/save-files → Files saved to temp folder
 * 2. /api/validate-upload ← YOU ARE HERE (validate before import)
 * 3. /api/rename-files → Apply suggested renames if needed
 * 4. /api/import-to-database → Import validated files
 * 
 * AUTO-RENAME OPTION:
 * - autoRename=false (default from API): Return suggestions, let user confirm
 * - autoRename=true: Automatically rename files (used in CLI, risky in API)
 * - Recommendation: Always confirm renames with user to prevent mistakes
 * 
 * DATA SOURCE:
 * - Delegates to validateUploadedFiles from @/database/validateUpload
 * - Uses excelValidator module for pattern matching
 * - References expected-tables.json for schema definitions
 * 
 * USE IN DASHBOARD:
 * Powers the "Validate Files" step in upload wizard, showing green checkmarks
 * for valid files and red flags for issues requiring user attention.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFiles } from "@/database/validateUpload";
import * as path from "path";
import * as fs from "fs";

/**
 * POST /api/validate-upload
 * 
 * Validates uploaded Excel files against expected schema.
 * 
 * @param request - HTTP request with body:
 *   - folderPath: Path to folder containing uploaded files
 * 
 * @returns JSON response with validation report:
 *   - success: boolean
 *   - validation: { validFiles, invalidFiles, missingFiles, suggestions }
 *   - message: Human-readable summary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath } = body;

    // Validate required parameter
    if (!folderPath) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 },
      );
    }

    // Validate that the folder exists
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    /**
     * VALIDATION LOGIC:
     * - Scans all .xlsx files in folder
     * - Checks each file's name, sheets, and columns
     * - Determines which database table each file maps to
     * - Identifies files that don't match expected patterns
     * - Suggests renames for files with minor naming issues
     * 
     * autoRename=false: Don't modify files, just return suggestions
     */
    const result = await validateUploadedFiles({
      uploadedFolderPath: folderPath,
      autoRename: false, // Don't auto-rename from API, let user confirm
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        validation: result.validation,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
