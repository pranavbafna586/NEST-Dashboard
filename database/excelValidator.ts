import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
config();

interface SheetInfo {
  fileName: string;
  sheetName: string;
  columns: string[];
  rowCount: number;
}

interface ExcelFileDetails {
  fileName: string;
  filePath: string;
  sheets: SheetInfo[];
}

interface ValidationResult {
  isValid: boolean;
  missingFiles: string[];
  renamedFiles: Array<{ oldName: string; newName: string; reason?: string }>;
  differences: string;
  newFolderName: string;
}

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract column names from a worksheet
function getColumnNames(worksheet: XLSX.WorkSheet): string[] {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  const columns: string[] = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
    const cell = worksheet[cellAddress];
    columns.push(cell ? String(cell.v) : `Column_${col + 1}`);
  }

  return columns;
}

// Get row count from a worksheet
function getRowCount(worksheet: XLSX.WorkSheet): number {
  if (!worksheet["!ref"]) return 0;
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  return range.e.r - range.s.r;
}

// Process a single Excel file with retry logic
function processExcelFile(filePath: string): ExcelFileDetails {
  const fileName = path.basename(filePath);

  // Retry logic for OneDrive sync issues
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const workbook = XLSX.readFile(filePath, { cellDates: true });
      const sheets: SheetInfo[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const columns = getColumnNames(worksheet);
        const rowCount = getRowCount(worksheet);

        sheets.push({
          fileName,
          sheetName,
          columns,
          rowCount,
        });
      });

      return {
        fileName,
        filePath,
        sheets,
      };
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Error processing ${fileName} (attempt ${attempt + 1}/${maxRetries}):`,
        error,
      );

      // Wait before retry (100ms, then 200ms, then 300ms)
      if (attempt < maxRetries - 1) {
        const waitTime = (attempt + 1) * 100;
        const waitMs = new Promise((resolve) => setTimeout(resolve, waitTime));
        // Synchronous wait using busy loop (not ideal but works for retry)
        const start = Date.now();
        while (Date.now() - start < waitTime) {
          // Busy wait
        }
      }
    }
  }

  // All retries failed
  console.error(
    `Failed to process ${fileName} after ${maxRetries} attempts:`,
    lastError,
  );
  return {
    fileName,
    filePath,
    sheets: [],
  };
}

// Get all Excel files from a directory
function getExcelFiles(dirPath: string): string[] {
  const files = fs.readdirSync(dirPath);
  return files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        ext === ".xlsx" || ext === ".xls" || ext === ".xlsm" || ext === ".xlsb"
      );
    })
    .map((file) => path.join(dirPath, file));
}

// Generate structured output for analysis
function generateStructuredOutput(fileDetails: ExcelFileDetails[]): string {
  let output = "";

  fileDetails.forEach((file) => {
    output += `\n📂 File: ${file.fileName}\n`;
    file.sheets.forEach((sheet, idx) => {
      output += `  📊 Sheet ${idx + 1}: ${sheet.sheetName}\n`;
      output += `     Rows: ${sheet.rowCount}\n`;
      output += `     Columns (${sheet.columns.length}): ${sheet.columns.join(", ")}\n`;
    });
  });

  return output;
}

// Compare received files with expected using Gemini AI
async function compareWithGemini(
  receivedData: string,
  expectedData: string,
  folderName: string,
): Promise<ValidationResult> {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });

  const systemPrompt = `You are an Excel file validation and renaming expert. Your task is to:

1. EXTRACT STUDY NUMBER: From the folder name "${folderName}", extract the study number (e.g., "Study 1" -> 1, "Study 15" -> 15).

2. COMPARE FILES: Compare the received Excel files structure with the expected structure.
   - Check if all expected files are present
   - Identify any missing files
   - Compare sheet names and column structures
   - Identify differences in file names

3. GENERATE RENAME MAPPINGS: For each received file, suggest the correct expected file name.
   - The received files have patterns like "Study 1_Compiled_EDRR_updated.xlsx"
   - The expected files have patterns like "Compiled_EDRR.xlsx"
   - Map each received file to its expected counterpart based on content similarity

4. FOLDER RENAME: Suggest the new folder name in format "Study {number}"

EXPECTED STRUCTURE:
${expectedData}

RECEIVED STRUCTURE:
${receivedData}

RESPOND IN VALID JSON FORMAT ONLY (no markdown, no code blocks):
{
  "isValid": boolean,
  "newFolderName": "Study X",
  "missingFiles": ["file1.xlsx", "file2.xlsx"],
  "renamedFiles": [
    {
      "oldName": "Study 1_Compiled_EDRR_updated.xlsx",
      "newName": "Compiled_EDRR.xlsx",
      "reason": "Brief explanation"
    }
  ],
  "differences": "Detailed summary of differences found",
  "allFilesPresent": boolean
}`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }

    const parsedResult = JSON.parse(cleanedResponse);

    return {
      isValid: parsedResult.isValid,
      missingFiles: parsedResult.missingFiles || [],
      renamedFiles: parsedResult.renamedFiles || [],
      differences: parsedResult.differences || "",
      newFolderName: parsedResult.newFolderName,
    };
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    throw error;
  }
}

// Main validation function
export async function validateAndRenameExcelFiles(
  uploadedFolderPath: string,
  expectedFilePath: string,
): Promise<ValidationResult> {
  console.log("\n🔍 Starting Excel Files Validation...\n");

  // Read expected structure
  const expectedData = fs.readFileSync(expectedFilePath, "utf-8");

  // Get folder name
  const folderName = path.basename(uploadedFolderPath);
  console.log(`📁 Uploaded Folder: ${folderName}`);

  // Process received files
  const excelFiles = getExcelFiles(uploadedFolderPath);
  if (excelFiles.length === 0) {
    throw new Error("No Excel files found in the uploaded folder!");
  }

  const receivedFileDetails = excelFiles.map((filePath) =>
    processExcelFile(filePath),
  );

  const receivedData = generateStructuredOutput(receivedFileDetails);

  console.log(`📊 Found ${excelFiles.length} Excel file(s)\n`);

  // Compare with Gemini AI
  console.log("🤖 Analyzing with Gemini AI...\n");
  const validationResult = await compareWithGemini(
    receivedData,
    expectedData,
    folderName,
  );

  // Display results
  console.log("=".repeat(60));
  console.log("\n📋 VALIDATION RESULTS\n");
  console.log("=".repeat(60));
  console.log(`\n✓ Valid: ${validationResult.isValid ? "YES" : "NO"}`);
  console.log(`✓ New Folder Name: ${validationResult.newFolderName}`);

  if (validationResult.missingFiles.length > 0) {
    console.log("\n⚠️  Missing Files:");
    validationResult.missingFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }

  if (validationResult.renamedFiles.length > 0) {
    console.log("\n📝 Files to Rename:");
    validationResult.renamedFiles.forEach((mapping) => {
      console.log(`   ${mapping.oldName}`);
      console.log(`   → ${mapping.newName}`);
      if (mapping.reason) {
        console.log(`     Reason: ${mapping.reason}`);
      }
      console.log();
    });
  }

  if (validationResult.differences) {
    console.log("\n📊 Differences Found:");
    console.log(validationResult.differences);
  }

  console.log("\n" + "=".repeat(60));

  return validationResult;
}

// Perform actual renaming
export async function performRenaming(
  uploadedFolderPath: string,
  validationResult: ValidationResult,
): Promise<string> {
  console.log("\n🔄 Starting File Renaming Process...\n");

  // Rename files
  for (const mapping of validationResult.renamedFiles) {
    const oldPath = path.join(uploadedFolderPath, mapping.oldName);
    const newPath = path.join(uploadedFolderPath, mapping.newName);

    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${mapping.oldName} → ${mapping.newName}`);
      } catch (error) {
        console.error(`❌ Failed to rename ${mapping.oldName}:`, error);
      }
    } else {
      console.warn(`⚠️  File not found: ${mapping.oldName}`);
    }
  }

  // Rename folder
  const parentDir = path.dirname(uploadedFolderPath);
  const newFolderPath = path.join(parentDir, validationResult.newFolderName);

  if (uploadedFolderPath !== newFolderPath) {
    try {
      fs.renameSync(uploadedFolderPath, newFolderPath);
      console.log(
        `\n✅ Renamed folder: ${path.basename(uploadedFolderPath)} → ${validationResult.newFolderName}`,
      );
    } catch (error) {
      console.error("❌ Failed to rename folder:", error);
      return uploadedFolderPath; // Return old path if rename failed
    }
  }

  console.log("\n✨ Renaming process completed!\n");
  return newFolderPath; // Return the new folder path
}
