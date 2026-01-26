/**
 * Validation utility for upload button integration
 * This can be called from your Next.js API route or frontend
 */

import { validateAndRenameExcelFiles, performRenaming } from "./excelValidator";
import { importExcelToDatabase } from "./importToDatabase";
import * as path from "path";

export interface UploadValidationOptions {
  uploadedFolderPath: string;
  expectedFilePath?: string;
  autoRename?: boolean;
  autoImportToDb?: boolean;
}

export async function validateUploadedFiles(options: UploadValidationOptions) {
  const {
    uploadedFolderPath,
    expectedFilePath = path.join(process.cwd(), "database", "txt-expected.txt"),
    autoRename = false,
    autoImportToDb = false,
  } = options;

  try {
    // Validate
    const validationResult = await validateAndRenameExcelFiles(
      uploadedFolderPath,
      expectedFilePath,
    );

    let renamedFolderPath = uploadedFolderPath;
    let dbImportResult = null;

    // Auto-rename if requested
    if (autoRename && validationResult.isValid) {
      renamedFolderPath = await performRenaming(
        uploadedFolderPath,
        validationResult,
      );

      // Auto-import to database if requested
      if (autoImportToDb) {
        dbImportResult = await importExcelToDatabase(
          renamedFolderPath,
          validationResult.newFolderName,
        );
      }
    }

    return {
      success: true,
      validation: validationResult,
      renamedFolderPath,
      dbImport: dbImportResult,
      message: validationResult.isValid
        ? "All files validated successfully!"
        : "Validation completed with issues. Please review.",
    };
  } catch (error) {
    return {
      success: false,
      validation: null,
      renamedFolderPath: null,
      dbImport: null,
      message: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      error,
    };
  }
}

// Example usage function - Full pipeline
export async function handleFileUpload(
  folderPath: string,
  autoProcess: boolean = false,
) {
  console.log("📤 Processing uploaded files...\n");

  const result = await validateUploadedFiles({
    uploadedFolderPath: folderPath,
    autoRename: autoProcess,
    autoImportToDb: autoProcess,
  });

  if (result.success && result.validation) {
    console.log("\n✅ Upload validation successful!");
    console.log(`📊 Files present: ${result.validation.renamedFiles.length}`);
    console.log(`⚠️  Missing files: ${result.validation.missingFiles.length}`);

    if (result.dbImport) {
      console.log(`\n🗄️  Database: ${result.dbImport.databasePath}`);
      console.log(`✅ Data imported: ${result.dbImport.success}`);
    }

    return {
      valid: result.validation.isValid,
      data: result.validation,
      renamedPath: result.renamedFolderPath,
      dbImport: result.dbImport,
    };
  } else {
    console.error("\n❌ Upload validation failed!");
    console.error(result.message);
    throw new Error(result.message);
  }
}
