import * as path from "path";
import { config } from "dotenv";
import { validateAndRenameExcelFiles, performRenaming } from "./excelValidator";
import { importExcelToDatabase } from "./importToDatabase";

// Load environment variables
config();

async function main() {
  try {
    // Paths - update these as needed
    const uploadedFolderPath = path.join(
      __dirname,
      "..",
      "Study 1_CPID_Input Files - Anonymization",
    );

    const expectedFilePath = path.join(__dirname, "txt-expected.txt");

    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║       Excel Files Validation & Renaming System        ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Step 1: Validate and get rename mappings
    const validationResult = await validateAndRenameExcelFiles(
      uploadedFolderPath,
      expectedFilePath,
    );

    // Step 2: Ask user for confirmation
    console.log("\n❓ Do you want to proceed with renaming? (yes/no)");
    console.log("   Note: This will rename files and folders permanently.");

    // For automated testing, you can skip this and auto-proceed
    // Uncomment the following lines for manual confirmation:
    /*
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nYour answer: ', async (answer: string) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await performRenaming(uploadedFolderPath, validationResult);
      } else {
        console.log('\n❌ Renaming cancelled.');
      }
      readline.close();
    });
    */

    // Auto-proceed for testing (comment out if you want manual confirmation)
    console.log("\n⚡ Auto-proceeding with renaming...\n");
    const renamedFolderPath = await performRenaming(
      uploadedFolderPath,
      validationResult,
    );

    // Save validation report
    const reportPath = path.join(__dirname, "validation-report.json");
    const fs = require("fs");
    fs.writeFileSync(reportPath, JSON.stringify(validationResult, null, 2));
    console.log(`\n📄 Validation report saved to: ${reportPath}`);

    // Step 3: Import to database
    console.log("\n" + "=".repeat(60));
    console.log("Starting database import process...");
    console.log("=".repeat(60) + "\n");

    const importResult = await importExcelToDatabase(
      renamedFolderPath,
      validationResult.newFolderName,
    );

    if (importResult.success) {
      console.log("\n🎉 Complete workflow finished successfully!");
      console.log(`   Database: ${importResult.databasePath}`);
      console.log(`   Study: ${validationResult.newFolderName}`);
    } else {
      console.error("\n⚠️  Database import failed:", importResult.error);
    }
  } catch (error) {
    console.error("\n❌ Error during validation:", error);
    process.exit(1);
  }
}

main();
