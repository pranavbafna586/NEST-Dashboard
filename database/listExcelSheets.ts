import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// Output file stream
let outputContent = "";

function log(message: string) {
  console.log(message);
  outputContent += message + "\n";
}

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

// Extract column names from a worksheet
function getColumnNames(worksheet: XLSX.WorkSheet): string[] {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  const columns: string[] = [];

  // Get first row (header row)
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
  return range.e.r - range.s.r; // Total rows minus header
}

// Process a single Excel file
function processExcelFile(filePath: string): ExcelFileDetails {
  const fileName = path.basename(filePath);
  log(`\n📂 Processing: ${fileName}`);

  try {
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    const sheets: SheetInfo[] = [];

    // Process each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const columns = getColumnNames(worksheet);
      const rowCount = getRowCount(worksheet);

      sheets.push({
        fileName,
        sheetName,
        columns,
        rowCount,
      });

      log(`\n  📊 Sheet ${index + 1}: ${sheetName}`);
      log(`     Rows: ${rowCount}`);
      log(`     Columns (${columns.length}):`);
      columns.forEach((col, idx) => {
        log(`       ${idx + 1}. ${col}`);
      });
    });

    return {
      fileName,
      filePath,
      sheets,
    };
  } catch (error) {
    console.error(`  ❌ Error processing ${fileName}:`, error);
    return {
      fileName,
      filePath,
      sheets: [],
    };
  }
}

// Main function to process all Excel files in a directory
function getAllExcelDetails(directoryPath: string) {
  log("\n=== Excel Files Analysis ===");
  log(`Directory: ${directoryPath}\n`);

  if (!fs.existsSync(directoryPath)) {
    console.error(`❌ Directory not found: ${directoryPath}`);
    return;
  }

  const excelFiles = getExcelFiles(directoryPath);

  if (excelFiles.length === 0) {
    log("⚠️  No Excel files found in the directory.");
    return;
  }

  log(`Found ${excelFiles.length} Excel file(s)\n`);
  log("=".repeat(60));

  const allFileDetails: ExcelFileDetails[] = [];

  excelFiles.forEach((filePath, index) => {
    const fileDetails = processExcelFile(filePath);
    allFileDetails.push(fileDetails);
    log("\n" + "=".repeat(60));
  });

  // Summary
  log("\n\n=== SUMMARY ===\n");
  const totalSheets = allFileDetails.reduce(
    (sum, file) => sum + file.sheets.length,
    0,
  );
  log(`Total Excel Files: ${allFileDetails.length}`);
  log(`Total Sheets: ${totalSheets}\n`);

  // Detailed summary
  allFileDetails.forEach((fileDetail, index) => {
    log(`${index + 1}. ${fileDetail.fileName}`);
    fileDetail.sheets.forEach((sheet, sheetIndex) => {
      log(
        `   └─ ${sheetIndex + 1}. ${sheet.sheetName} (${sheet.columns.length} columns, ${sheet.rowCount} rows)`,
      );
    });
  });

  // Save to file
  const outputPath = path.join(__dirname, "excel_sheets_output.txt");
  fs.writeFileSync(outputPath, outputContent);
  log(`\n✅ Output saved to: ${outputPath}`);

  return allFileDetails;
}

// Usage - Update the path to your Excel files directory
const excelDirectory = path.join(
  __dirname,
  "..",
  "Study 1_CPID_Input Files - Anonymization",
);

// Alternative: You can also specify a direct path
// const excelDirectory = 'C:\\Users\\Pranav\\OneDrive\\Desktop\\New folder\\nest\\Study 1_CPID_Input Files - Anonymization';

getAllExcelDetails(excelDirectory);

// Export for use in other files
export { getAllExcelDetails, processExcelFile, getExcelFiles };
