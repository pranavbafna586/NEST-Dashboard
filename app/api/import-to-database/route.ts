/**
 * Import to Database API Endpoint
 * 
 * PURPOSE:
 * Reads validated Excel files from temp folder and populates SQLite database tables.
 * Final step in the study data upload workflow, making new data available to dashboard.
 * 
 * BUSINESS CONTEXT - Data Import Process:
 * After files are uploaded, validated, and optionally renamed, this endpoint:
 * - Reads all Excel files in the study folder
 * - Parses sheets and maps data to database tables
 * - Inserts rows into SQLite database (clinical_trial.db)
 * - Creates indexes for query performance
 * - Makes data immediately available to dashboard API endpoints
 * 
 * WORKFLOW POSITION:
 * 1. /api/save-files → Files uploaded to temp
 * 2. /api/validate-upload → Structure validated
 * 3. /api/rename-files → Names standardized (if needed)
 * 4. /api/import-to-database ← YOU ARE HERE (final step)
 * 
 * IMPORT PROCESS:
 * 1. Receives folder path containing standardized Excel files
 * 2. Extracts study name from folder (e.g., "Study 1")
 * 3. For each Excel file:
 *    - Determines target database table from file name pattern
 *    - Reads Excel sheets using ExcelJS or xlsx library
 *    - Maps columns to database schema
 *    - Inserts/updates rows in SQLite
 * 4. Creates database indexes for performance
 * 5. Returns success with database path
 * 
 * TABLES POPULATED:
 * - subject_level_metrics: Subject demographics and metrics
 * - query_report: Data quality queries
 * - sae_issues: Serious adverse events
 * - protocol_deviation: Protocol violations
 * - pi_signature_report: Electronic signature compliance
 * - sdv_report: Source data verification status
 * - edrr_issues: External data reconciliation issues
 * - ...and others based on available Excel files
 * 
 * DATA TRANSFORMATION:
 * - Date strings → SQLite DATE format
 * - Numeric strings → INTEGER or REAL
 * - Empty cells → NULL
 * - Formulas → Calculated values only (not formulas)
 * 
 * DATABASE LOCATION:
 * - Development: ./data/clinical_trial.db
 * - Production: Configurable via DATABASE_PATH env var
 * - Creates database if doesn't exist
 * - Appends data if database already has other studies
 * 
 * STUDY NAME HANDLING:
 * - Extracted from folder name: "Study 1" from "C:\\Temp\\Study 1\\"
 * - Fallback to "Study 1" if extraction fails
 * - Used to populate project_name column in all tables
 * - Enables multi-study support in single database
 * 
 * ERROR SCENARIOS:
 * - Folder not found: 404 error (temp folder was deleted)
 * - Invalid Excel format: 500 error (corrupt file or wrong format)
 * - Schema mismatch: 500 error (columns don't match expected structure)
 * - Database locked: 500 error (another import in progress)
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Large files (1000+ rows): May take 10-30 seconds
 * - Progress updates not implemented (consider adding for UX)
 * - Transaction batching for performance
 * - Indexes created after bulk insert for speed
 * 
 * POST-IMPORT:
 * - Dashboard should refresh/reload to show new data
 * - Cache should be cleared (/api/refresh-cache?clearAll=true)
 * - Temp files can be deleted (not automatic, implement cleanup)
 * 
 * DATA SOURCE:
 * - Delegates to importExcelToDatabase from @/database/importToDatabase
 * - Uses SQLite better-sqlite3 driver for database operations
 * - Excel parsing via exceljs or xlsx library
 * 
 * USE IN DASHBOARD:
 * Final step of "Upload Study Data" wizard. Shows progress spinner while importing,
 * then redirects to dashboard showing newly imported study data.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFiles } from "@/database/validateUpload";
import { importExcelToDatabase } from "@/database/importToDatabase";
import * as fs from "fs";

/**
 * POST /api/import-to-database
 * 
 * Imports validated Excel files into SQLite database.
 * 
 * @param request - HTTP request with body:
 *   - folderPath: Path to folder containing validated Excel files
 * 
 * @returns JSON response:
 *   - success: boolean
 *   - message: Summary of import operation
 *   - databasePath: Path to updated database file
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
     * STUDY NAME EXTRACTION:
     * Extract study name from folder path for database records.
     * Example: "C:\\Temp\\Study 1" → "Study 1"
     * Regex: Split by path separators, take last segment
     * Fallback: "Study 1" if extraction fails
     */
    const folderName = folderPath.split(/[/\\]/).pop() || "Study 1";

    /**
     * DATABASE IMPORT:
     * - Reads all Excel files from folder
     * - Maps each file to appropriate database table
     * - Parses rows and inserts into SQLite
     * - Creates indexes for query performance
     * - Returns database path on success
     */
    const importResult = await importExcelToDatabase(folderPath, folderName);

    if (importResult.success) {
      return NextResponse.json({
        success: true,
        message: "Data imported to database successfully",
        databasePath: importResult.databasePath,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: importResult.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Database import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
