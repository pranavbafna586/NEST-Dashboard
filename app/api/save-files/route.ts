/**
 * Save Files API Endpoint
 * 
 * PURPOSE:
 * Receives uploaded Excel files via multipart/form-data, saves them to server temp directory,
 * and prepares them for validation and import. First step in the study data upload workflow.
 * 
 * BUSINESS CONTEXT - Study Data Upload Workflow:
 * Clinical trial data typically arrives as a collection of Excel files exported from various systems:
 * - EDC export: Subject metrics, visit data
 * - Safety database export: SAE reports
 * - Query management system export: Data quality queries
 * - External lab system exports: EDRR reconciliation data
 * - E-signature system exports: PI signature compliance
 * 
 * Users upload all these files together to populate a new study in the dashboard.
 * 
 * MULTI-STEP WORKFLOW:
 * 1. /api/save-files ← YOU ARE HERE
 *    - Receives files from browser
 *    - Extracts study number from filenames
 *    - Saves to temp folder (e.g., C:\Temp\Study 1\)
 *    - Returns folder path for next steps
 * 
 * 2. /api/validate-upload
 *    - Checks file names match expected patterns
 *    - Validates Excel sheet structures
 *    - Returns validation report with rename suggestions
 * 
 * 3. /api/rename-files (if needed)
 *    - Applies AI-suggested file renames
 *    - Standardizes naming for import
 * 
 * 4. /api/import-to-database
 *    - Reads validated Excel files
 *    - Populates SQLite database tables
 *    - Dashboard refreshes with new study data
 * 
 * STUDY NUMBER EXTRACTION:
 * Files typically named like: "Study 1_SAE_Report.xlsx", "Study 1_Query_Data.xlsx"
 * Regex pattern: `/Study\s*(\d+)/i` extracts "1" as study number
 * Fallback: Use timestamp if no study number found
 * 
 * TEMP DIRECTORY STRUCTURE:
 * Windows: C:\Users\USER\AppData\Local\Temp\Study 1\
 * - Study 1_SAE_Report.xlsx
 * - Study 1_Query_Data.xlsx
 * - Study 1_Subject_Metrics.xlsx
 * - ...
 * 
 * FILE WRITE VERIFICATION:
 * - Writes file buffer to disk
 * - Waits for file to become readable (max 5 retries × 100ms)
 * - Ensures filesystem has flushed before proceeding
 * - Critical for preventing import errors due to file not ready
 * 
 * SECURITY CONSIDERATIONS:
 * - No file type validation currently (add .xlsx check in production)
 * - No virus scanning (integrate ClamAV or similar for production)
 * - No size limits enforced (add max upload size check)
 * - Temp folder cleanup not automated (implement periodic cleanup)
 * 
 * ERROR HANDLING:
 * - No files: 400 Bad Request
 * - File write failure: 500 Internal Server Error
 * - File verification timeout: 500 with specific error message
 * 
 * USE IN DASHBOARD:
 * Powers the "Upload Study Data" wizard's file upload step with drag-and-drop interface.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";
import os from "os";
import { renameStudyFolderWithAI } from "@/database/studyNameExtractor";

/**
 * Helper: Extract study number from Excel file names
 * 
 * Looks for pattern "Study X" where X is a number.
 * Example: "Study 1_Compiled_EDRR.xlsx" → "1"
 * 
 * @param files - Array of uploaded files
 * @returns Study number or timestamp fallback
 */
function extractStudyNumber(files: File[]): string {
  // Look for study number in file names (e.g., "Study 1_Compiled_EDRR.xlsx" -> "1")
  for (const file of files) {
    const match = file.name.match(/Study\s*(\d+)/i);
    if (match) {
      return match[1];
    }
  }
  // Fallback to timestamp if no study number found
  return `${Date.now()}`;
}

/**
 * Helper: Wait for file to be accessible after write
 * 
 * Filesystem caching can delay file availability. This function
 * retries file access checks to ensure file is fully written.
 * 
 * @param filePath - Path to verify
 * @param maxRetries - Maximum retry attempts
 * @returns true if file becomes accessible, false otherwise
 */
async function waitForFileAccess(
  filePath: string,
  maxRetries = 5,
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await access(filePath, constants.R_OK);
      return true;
    } catch {
      // Wait 100ms before retry
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return false;
}

/**
 * POST /api/save-files
 * 
 * Saves uploaded Excel files to server temp directory.
 * 
 * @param request - HTTP request with multipart/form-data containing files
 * @returns JSON with folder path and file count
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    // Validate at least one file provided
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Extract study number from file names (e.g., "Study 1" from "Study 1_Compiled_EDRR.xlsx")
    const studyNumber = extractStudyNumber(files);
    const tempDir = os.tmpdir(); // Windows: C:\Users\USER\AppData\Local\Temp
    const uploadDir = path.join(tempDir, `Study ${studyNumber}`);

    // Create directory
    await mkdir(uploadDir, { recursive: true });

    // Save each file and verify it's accessible
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer, { flush: true });

      // Wait for file to be fully written and accessible
      const isAccessible = await waitForFileAccess(filePath);
      if (!isAccessible) {
        throw new Error(
          `File ${file.name} could not be verified as accessible`,
        );
      }
    }

    // Extra wait to ensure all files are ready
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log(`Files saved to temporary folder: ${uploadDir}`);
    
    // Use AI to detect correct study name from Excel data
    console.log("\nDetecting study name from data...");
    const renamedFolderPath = await renameStudyFolderWithAI(uploadDir);
    
    console.log(`Final folder path: ${renamedFolderPath}`);

    return NextResponse.json({
      success: true,
      folderPath: renamedFolderPath,
      filesCount: files.length,
    });
  } catch (error) {
    console.error("Error saving files:", error);
    return NextResponse.json(
      { error: "Failed to save files" },
      { status: 500 },
    );
  }
}
