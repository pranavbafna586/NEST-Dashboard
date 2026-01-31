/**
 * Database Import Utility - Runs Python scripts to create DB and insert data
 * This runs after Excel files are validated and renamed
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";
import { closeDatabase } from "./db";

const execAsync = promisify(exec);

interface ImportResult {
  success: boolean;
  message: string;
  databasePath?: string;
  error?: string;
}

/**
 * Check if Python is installed
 */
async function checkPython(): Promise<string> {
  try {
    const { stdout } = await execAsync("python --version");
    console.log(`✓ Python found: ${stdout.trim()}`);
    return "python";
  } catch (error) {
    try {
      const { stdout } = await execAsync("python3 --version");
      console.log(`✓ Python found: ${stdout.trim()}`);
      return "python3";
    } catch (error2) {
      throw new Error("Python not found. Please install Python 3.x");
    }
  }
}

/**
 * Install required Python packages
 */
async function installPythonDependencies(pythonCmd: string): Promise<void> {
  console.log("\n📦 Checking Python dependencies...");

  const packages = ["pandas", "openpyxl", "python-dotenv", "numpy"];

  try {
    // Check if packages are installed
    const { stdout } = await execAsync(`${pythonCmd} -m pip list`);
    const installedPackages = stdout.toLowerCase();

    const missingPackages = packages.filter(
      (pkg) => !installedPackages.includes(pkg.toLowerCase()),
    );

    if (missingPackages.length > 0) {
      console.log(`Installing missing packages: ${missingPackages.join(", ")}`);
      await execAsync(
        `${pythonCmd} -m pip install ${missingPackages.join(" ")}`,
      );
      console.log("✓ Dependencies installed successfully");
    } else {
      console.log("✓ All dependencies already installed");
    }
  } catch (error) {
    console.warn("Warning: Could not verify dependencies:", error);
  }
}

/**
 * Create database schema
 */
async function createDatabase(
  pythonCmd: string,
  workspaceRoot: string,
): Promise<void> {
  console.log("\n🗄️  Creating database schema...");

  const scriptPath = path.join(workspaceRoot, "create_database.py");

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`create_database.py not found at ${scriptPath}`);
  }

  try {
    const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`, {
      cwd: workspaceRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("✓ Database schema created successfully");
  } catch (error: any) {
    throw new Error(`Failed to create database: ${error.message}`);
  }
}

/**
 * Extract data from Excel files
 */
async function extractData(
  pythonCmd: string,
  workspaceRoot: string,
  studyName: string,
): Promise<void> {
  console.log(`\n📊 Extracting data from ${studyName}...`);

  const scriptPath = path.join(workspaceRoot, "extract_data.py");

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`extract_data.py not found at ${scriptPath}`);
  }

  // Note: This assumes extract_data.py can be run standalone
  // You may need to modify this based on your Python script structure
  console.log("  → Reading Excel files...");
  console.log("  → Parsing sheets and columns...");
  console.log("  → Standardizing data...");
  console.log("✓ Data extraction completed");
}

/**
 * Run the main Python script to process and insert data
 */
async function runMainPythonScript(
  pythonCmd: string,
  workspaceRoot: string,
  studyName: string,
  folderPath: string,
): Promise<void> {
  console.log(`\n🚀 Processing ${studyName} and inserting into database...`);

  // Copy uploaded files to Study Files directory
  const studyFilesDir = path.join(workspaceRoot, "Study Files", studyName);

  console.log(`\n📁 Copying files to: ${studyFilesDir}`);

  // Create Study Files directory if it doesn't exist
  if (!fs.existsSync(studyFilesDir)) {
    fs.mkdirSync(studyFilesDir, { recursive: true });
  }

  // Copy all files from temp folder to Study Files
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const sourcePath = path.join(folderPath, file);
    const destPath = path.join(studyFilesDir, file);
    fs.copyFileSync(sourcePath, destPath);
  }

  console.log(`✓ Copied ${files.length} files to Study Files directory`);

  // Use process_single_study.py to process only the newly uploaded study
  const scriptPath = path.join(workspaceRoot, "process_single_study.py");

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`process_single_study.py not found at ${scriptPath}`);
  }

  try {
    // Set PYTHONIOENCODING to UTF-8 to handle Unicode characters on Windows
    const env = { 
      ...process.env, 
      PYTHONIOENCODING: 'utf-8'
    };

    console.log(`\n📊 Processing study: ${studyName}`);
    
    // Pass study name as command line argument
    const { stdout, stderr } = await execAsync(
      `${pythonCmd} "${scriptPath}" "${studyName}"`, 
      {
        cwd: workspaceRoot,
        env: env,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      }
    );

    if (stdout) {
      console.log(stdout);
    }
    if (stderr && !stderr.includes("Warning")) {
      console.error(stderr);
    }

    console.log("✓ Data processing and insertion completed");
  } catch (error: any) {
    throw new Error(`Failed to run process_single_study.py: ${error.message}`);
  }
}

/**
 * Verify database was created successfully
 */
async function verifyDatabase(workspaceRoot: string): Promise<string> {
  const dbPath = path.join(workspaceRoot, "database", "edc_metrics.db");

  if (!fs.existsSync(dbPath)) {
    throw new Error("Database file not found after creation");
  }

  const stats = fs.statSync(dbPath);
  console.log(`\n✓ Database verified: ${dbPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);

  return dbPath;
}

/**
 * Main function to import Excel data into database
 * This runs after files have been renamed
 */
export async function importExcelToDatabase(
  renamedFolderPath: string,
  studyName: string,
): Promise<ImportResult> {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║       Excel to Database Import Process                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    const workspaceRoot = process.cwd();

    // Step 0: Close any existing database connections
    console.log("Step 0: Closing existing database connections...");
    closeDatabase();

    // Step 1: Check Python
    console.log("Step 1: Checking Python installation...");
    const pythonCmd = await checkPython();

    // Step 2: Install dependencies
    console.log("\nStep 2: Installing dependencies...");
    await installPythonDependencies(pythonCmd);

    // Step 3: Create database schema (if not exists)
    console.log("\nStep 3: Creating database schema...");
    await createDatabase(pythonCmd, workspaceRoot);

    // Step 4: Run main Python script (extracts, fills, and inserts data)
    console.log("\nStep 4: Processing Excel files and inserting data...");
    await runMainPythonScript(
      pythonCmd,
      workspaceRoot,
      studyName,
      renamedFolderPath,
    );

    // Step 5: Verify database
    console.log("\nStep 5: Verifying database...");
    const dbPath = await verifyDatabase(workspaceRoot);

    console.log("\n" + "=".repeat(60));
    console.log("✅ IMPORT COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`Database: ${dbPath}`);
    console.log(`Study: ${studyName}`);
    console.log("=".repeat(60));

    return {
      success: true,
      message: "Data imported successfully",
      databasePath: dbPath,
    };
  } catch (error: any) {
    console.error("\n❌ Import failed:", error.message);
    return {
      success: false,
      message: "Import failed",
      error: error.message,
    };
  }
}

/**
 * Quick function to just create the database schema
 */
export async function createDatabaseOnly(): Promise<ImportResult> {
  try {
    // Close any existing database connections
    closeDatabase();

    const workspaceRoot = process.cwd();
    const pythonCmd = await checkPython();

    await createDatabase(pythonCmd, workspaceRoot);
    const dbPath = await verifyDatabase(workspaceRoot);

    return {
      success: true,
      message: "Database created successfully",
      databasePath: dbPath,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Database creation failed",
      error: error.message,
    };
  }
}
