import * as XLSX from "xlsx";

export interface ColumnInfo {
  name: string;
  type: string;
  sampleValues: any[];
}

export interface SheetInfo {
  sheetName: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ExcelFileStructure {
  fileName: string;
  sheets: SheetInfo[];
  fileSize: number;
  uploadedAt: string;
}

/**
 * Analyzes an Excel file and extracts its structure
 */
export async function analyzeExcelFile(
  file: File,
): Promise<ExcelFileStructure> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheets: SheetInfo[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Get column headers (first row)
          const headers = (jsonData[0] as any[]) || [];

          // Get sample data (first 3 rows after header)
          const dataRows = jsonData.slice(1, 4);

          const columns: ColumnInfo[] = headers.map((header, index) => {
            const sampleValues = dataRows
              .map((row: any) => row[index])
              .filter((val) => val !== undefined && val !== null && val !== "");

            // Infer type from sample values
            let type = "string";
            if (sampleValues.length > 0) {
              if (sampleValues.every((v) => typeof v === "number")) {
                type = "number";
              } else if (
                sampleValues.every(
                  (v) =>
                    !isNaN(Date.parse(String(v))) && String(v).includes("-"),
                )
              ) {
                type = "date";
              }
            }

            return {
              name: String(header || `Column_${index + 1}`),
              type,
              sampleValues: sampleValues.slice(0, 3),
            };
          });

          return {
            sheetName,
            columns,
            rowCount: jsonData.length - 1, // Exclude header
          };
        });

        resolve({
          fileName: file.name,
          sheets,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
}

/**
 * Analyzes multiple Excel files
 */
export async function analyzeMultipleFiles(
  files: File[],
): Promise<ExcelFileStructure[]> {
  const analyses = await Promise.all(files.map(analyzeExcelFile));
  return analyses;
}

/**
 * Generates a text representation of file structures for Gemini
 */
export function generateStructureText(
  structures: ExcelFileStructure[],
): string {
  let text = "=== UPLOADED EXCEL FILES STRUCTURE ===\n\n";

  structures.forEach((structure, fileIndex) => {
    text += `FILE ${fileIndex + 1}: ${structure.fileName}\n`;
    text += `Size: ${(structure.fileSize / 1024).toFixed(2)} KB\n`;
    text += `Uploaded: ${structure.uploadedAt}\n`;
    text += `Number of Sheets: ${structure.sheets.length}\n\n`;

    structure.sheets.forEach((sheet, sheetIndex) => {
      text += `  SHEET ${sheetIndex + 1}: ${sheet.sheetName}\n`;
      text += `  Row Count: ${sheet.rowCount}\n`;
      text += `  Columns (${sheet.columns.length}):\n`;

      sheet.columns.forEach((col, colIndex) => {
        text += `    ${colIndex + 1}. ${col.name} (${col.type})`;
        if (col.sampleValues.length > 0) {
          text += ` - Sample: ${col.sampleValues.join(", ")}`;
        }
        text += "\n";
      });
      text += "\n";
    });

    text += "\n" + "=".repeat(60) + "\n\n";
  });

  return text;
}

/**
 * Saves structure analysis to a text file
 */
export function saveStructureToFile(
  structures: ExcelFileStructure[],
  filename: string = "uploaded_files_structure.txt",
): void {
  const text = generateStructureText(structures);
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
