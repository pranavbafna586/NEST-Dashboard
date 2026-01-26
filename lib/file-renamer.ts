import * as XLSX from "xlsx";
import {
  FileMappingInstruction,
  GeminiMappingResponse,
} from "./gemini-mapping";

export interface RenameResult {
  success: boolean;
  originalFileName: string;
  newFileName: string;
  renamedFile: File;
  sheetsRenamed: number;
  columnsRenamed: number;
  errors: string[];
}

/**
 * Rename files and columns based on Gemini mapping instructions
 */
export async function renameFilesAndColumns(
  files: File[],
  mappingResponse: GeminiMappingResponse,
): Promise<RenameResult[]> {
  const results: RenameResult[] = [];

  for (const fileMapping of mappingResponse.fileMappings) {
    // Find the corresponding file
    const file = files.find((f) => f.name === fileMapping.uploadedFileName);

    if (!file) {
      results.push({
        success: false,
        originalFileName: fileMapping.uploadedFileName,
        newFileName: fileMapping.standardFileName,
        renamedFile: file as File,
        sheetsRenamed: 0,
        columnsRenamed: 0,
        errors: ["File not found in uploaded files"],
      });
      continue;
    }

    try {
      const result = await renameFileAndColumns(file, fileMapping);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        originalFileName: file.name,
        newFileName: fileMapping.standardFileName,
        renamedFile: file,
        sheetsRenamed: 0,
        columnsRenamed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    }
  }

  return results;
}

/**
 * Rename a single file and its columns
 */
async function renameFileAndColumns(
  file: File,
  mapping: FileMappingInstruction,
): Promise<RenameResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let sheetsRenamed = 0;
    let columnsRenamed = 0;
    const errors: string[] = [];

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Process each sheet mapping
        mapping.sheetMappings.forEach((sheetMapping) => {
          const worksheet = workbook.Sheets[sheetMapping.uploadedSheetName];

          if (!worksheet) {
            errors.push(`Sheet not found: ${sheetMapping.uploadedSheetName}`);
            return;
          }

          // Rename columns
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonData.length > 0) {
            const headers = jsonData[0] as any[];

            // Create mapping for column renames
            sheetMapping.columnMappings.forEach((colMapping) => {
              if (colMapping.requiresRename) {
                const colIndex = headers.findIndex(
                  (h) => h === colMapping.uploadedColumnName,
                );
                if (colIndex !== -1) {
                  headers[colIndex] = colMapping.standardColumnName;
                  columnsRenamed++;
                }
              }
            });

            // Update the worksheet with renamed columns
            jsonData[0] = headers;
            const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);

            // Replace old worksheet
            delete workbook.Sheets[sheetMapping.uploadedSheetName];
            workbook.Sheets[sheetMapping.standardSheetName] = newWorksheet;

            // Update sheet names in workbook
            const sheetIndex = workbook.SheetNames.indexOf(
              sheetMapping.uploadedSheetName,
            );
            if (sheetIndex !== -1) {
              workbook.SheetNames[sheetIndex] = sheetMapping.standardSheetName;
              sheetsRenamed++;
            }
          }
        });

        // Convert workbook back to binary
        const wbout = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "binary",
        });

        // Convert binary string to array buffer
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) {
          view[i] = wbout.charCodeAt(i) & 0xff;
        }

        // Create new file with standardized name
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const renamedFile = new File([blob], mapping.standardFileName, {
          type: file.type,
        });

        resolve({
          success: true,
          originalFileName: file.name,
          newFileName: mapping.standardFileName,
          renamedFile,
          sheetsRenamed,
          columnsRenamed,
          errors,
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
 * Save renamed files to a directory
 */
export async function saveRenamedFiles(
  results: RenameResult[],
  outputDirectory: string = "standardized_files",
): Promise<void> {
  // Create FormData to send to server
  const formData = new FormData();

  results.forEach((result, index) => {
    if (result.success) {
      formData.append(`file_${index}`, result.renamedFile);
    }
  });

  formData.append("outputDirectory", outputDirectory);

  // Send to server to save
  const response = await fetch("/api/save-files", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to save files: ${response.statusText}`);
  }
}

/**
 * Generate rename report text file
 */
export function generateRenameReport(results: RenameResult[]): string {
  let report = "=== FILE RENAME REPORT ===\n\n";
  report += `Total Files Processed: ${results.length}\n`;
  report += `Successful: ${results.filter((r) => r.success).length}\n`;
  report += `Failed: ${results.filter((r) => !r.success).length}\n\n`;

  results.forEach((result, index) => {
    report += `\n${index + 1}. ${result.success ? "✓" : "✗"} `;
    report += `${result.originalFileName}\n`;
    report += `   → ${result.newFileName}\n`;
    report += `   Sheets Renamed: ${result.sheetsRenamed}\n`;
    report += `   Columns Renamed: ${result.columnsRenamed}\n`;

    if (result.errors.length > 0) {
      report += `   Errors:\n`;
      result.errors.forEach((error) => {
        report += `     - ${error}\n`;
      });
    }
    report += "\n";
  });

  return report;
}

/**
 * Save rename report to file
 */
export function saveRenameReport(
  results: RenameResult[],
  filename: string = "rename_report.txt",
): void {
  const report = generateRenameReport(results);
  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
