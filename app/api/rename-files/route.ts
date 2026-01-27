/**
 * Rename Files API Endpoint
 * 
 * PURPOSE:
 * Applies validated rename suggestions to Excel files and folder, standardizing names
 * for successful database import. Step 3 in upload workflow (optional).
 * 
 * BUSINESS CONTEXT - Why Renaming is Needed:
 * File names control which database table the data maps to. Inconsistent naming
 * prevents automatic import. Examples:
 * 
 * PROBLEMATIC NAMES → STANDARDIZED NAMES:
 * - "SAE_issues_v2.xlsx" → "Study 1_SAE_Report.xlsx"
 * - "QC_Report_Final.xlsx" → "Study 1_Query_Report.xlsx"
 * - "EDRR_Data.xlsx" → "Study 1_EDRR_Issues.xlsx"
 * - Folder: "Study1" → "Study 1" (requires space for import logic)
 * 
 * RENAME SAFETY:
 * - Only renames files in temp directory (not user's original files)
 * - Validation must pass before renaming enabled
 * - User confirms rename suggestions before applying
 * - Original upload preserved until import completes
 * 
 * WORKFLOW POSITION:
 * 1. /api/save-files → Files saved to temp
 * 2. /api/validate-upload → Identifies files needing renames
 * 3. /api/rename-files ← YOU ARE HERE (apply renames)
 * 4. /api/import-to-database → Import standardized files
 * 
 * WHAT GETS RENAMED:
 * - Individual Excel files to match expected patterns
 * - Folder name to ensure consistent study number formatting
 * - Example: Folder "Study1" becomes "Study 1"
 * 
 * VALIDATION RESULT INPUT:
 * This endpoint expects the validation result from /api/validate-upload:
 * ```json
 * {
 *   "folderPath": "C:\\Temp\\Study1",
 *   "validationResult": {
 *     "validation": {
 *       "suggestions": [
 *         { "from": "SAE_data.xlsx", "to": "Study 1_SAE_Report.xlsx" },
 *         { "folder": { "from": "Study1", "to": "Study 1" } }
 *       ]
 *     }
 *   }
 * }
 * ```
 * 
 * RENAME OPERATIONS:
 * 1. Renames files within folder according to suggestions
 * 2. Renames folder itself if needed (updates path)
 * 3. Returns new folder path for import step
 * 
 * ERROR SCENARIOS:
 * - Folder not found: Node deleted folder between validation and rename
 * - File locked: Another process has Excel file open
 * - Permission denied: Temp folder has restrictive permissions
 * 
 * DATA SOURCE:
 * - Delegates to performRenaming from @/database/excelValidator
 * - Uses filesystem operations (fs.rename) to apply changes
 * 
 * USE IN DASHBOARD:
 * User sees rename suggestions in upload wizard, clicks "Apply Renames" button,
 * which calls this endpoint to standardize file names before import.
 */

import { NextRequest, NextResponse } from "next/server";
import { performRenaming } from "@/database/excelValidator";
import * as fs from "fs";

/**
 * POST /api/rename-files
 * 
 * Applies rename suggestions from validation to standardize file names.
 * 
 * @param request - HTTP request with body:
 *   - folderPath: Current folder path
 *   - validationResult: Result from /api/validate-upload with rename suggestions
 * 
 * @returns JSON response:
 *   - success: boolean
 *   - message: Summary of rename operations
 *   - newFolderPath: Updated path if folder was renamed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath, validationResult } = body;

    // Validate required parameters
    if (!folderPath || !validationResult) {
      return NextResponse.json(
        { error: "Folder path and validation result are required" },
        { status: 400 },
      );
    }

    // Validate that the folder exists
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    /**
     * VALIDATION STRUCTURE NORMALIZATION:
     * Frontend may send validationResult wrapped in { validation: {...} }
     * or directly as the validation object. Handle both cases.
     */
    const validation = validationResult.validation || validationResult;

    /**
     * PERFORM RENAMING:
     * - Renames individual files according to suggestions
     * - Renames folder if needed (e.g., "Study1" → "Study 1")
     * - Returns new folder path (may be different if folder renamed)
     */
    const newFolderPath = await performRenaming(folderPath, validation);

    return NextResponse.json({
      success: true,
      message: "Files and folder renamed successfully",
      newFolderPath,
    });
  } catch (error) {
    console.error("Renaming error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
