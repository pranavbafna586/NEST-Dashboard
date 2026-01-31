/**
 * Study Name Extractor using Gemini AI
 * Reads sample data from Excel files and uses AI to determine the correct study name
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface StudyNameResult {
  studyName: string;
  confidence: "high" | "medium" | "low";
  source: string;
}

/**
 * Read sample rows from an Excel file
 */
function readSampleData(filePath: string, maxRows: number = 10): string {
  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: "",
      range: 0,
      // Only read first N rows
    });
    
    // Take first 10 rows (including header)
    const sampleRows = data.slice(0, Math.min(maxRows, data.length));
    
    // Format as readable text
    let output = `File: ${path.basename(filePath)}\n`;
    output += `Sheet: ${firstSheetName}\n\n`;
    
    if (sampleRows.length > 0) {
      // Get headers
      const headers = sampleRows[0] as unknown[];
      output += "Columns: " + headers.join(" | ") + "\n\n";
      
      // Add sample rows
      output += "Sample Data:\n";
      for (let i = 1; i < sampleRows.length && i <= maxRows; i++) {
        const row = sampleRows[i] as unknown[];
        output += `Row ${i}: ${row.join(" | ")}\n`;
      }
    }
    
    return output;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return "";
  }
}

/**
 * Use Gemini AI to extract study name from Excel data
 */
async function extractStudyNameWithAI(
  folderPath: string,
): Promise<StudyNameResult> {
  console.log("\n🤖 Using AI to detect study name...");
  
  // Get all Excel files in the folder
  const files = fs.readdirSync(folderPath);
  const excelFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".xlsx" || ext === ".xls" || ext === ".xlsm";
  });
  
  if (excelFiles.length === 0) {
    throw new Error("No Excel files found in folder");
  }
  
  // Read sample data from all files (prefer Subject Level Metrics file)
  let sampleData = "";
  
  // Prioritize Subject Level Metrics file
  const subjectFile = excelFiles.find((f) =>
    f.toLowerCase().includes("subject") || f.toLowerCase().includes("metric")
  );
  
  if (subjectFile) {
    sampleData += readSampleData(path.join(folderPath, subjectFile), 10);
  } else {
    // Read from first 2 files if Subject file not found
    for (let i = 0; i < Math.min(2, excelFiles.length); i++) {
      sampleData += readSampleData(path.join(folderPath, excelFiles[i]), 10);
      sampleData += "\n" + "=".repeat(60) + "\n\n";
    }
  }
  
  // Create AI prompt
  const prompt = `You are analyzing clinical trial data files. Based on the sample data below, identify the study name or study number.

${sampleData}

IMPORTANT INSTRUCTIONS:
1. Look for columns named "project_name", "study", "study_name", "protocol", or similar
2. Look at the actual data values in those columns
3. The study name is usually consistent across all rows
4. Common formats: "Study 1", "Study 2", "CPID-2024-001", "Protocol ABC", etc.
5. If you find a clear study name/number, return it in a clean format
6. If the study name has a number like "1", "2", etc., format it as "Study 1", "Study 2", etc.
7. Remove any extra prefixes or suffixes that don't look like part of the official name

Return ONLY a JSON object in this exact format:
{
  "studyName": "Study 1",
  "confidence": "high",
  "reasoning": "Found 'Study 1' consistently in project_name column across all rows"
}

Confidence levels:
- "high": Found study name in dedicated column with consistent values
- "medium": Found study name in data but not perfectly consistent
- "low": Had to guess based on file names or partial information

Return ONLY the JSON object, nothing else.`;

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Response:", text);
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    console.log(`✓ Study name detected: "${parsed.studyName}" (${parsed.confidence} confidence)`);
    console.log(`  Reasoning: ${parsed.reasoning}`);
    
    return {
      studyName: parsed.studyName,
      confidence: parsed.confidence,
      source: "AI analysis of Excel data",
    };
  } catch (error) {
    console.error("Error using AI to extract study name:", error);
    
    // Fallback: try to find study name in sample data directly
    const studyMatch = sampleData.match(/Study\s*(\d+)/i);
    if (studyMatch) {
      return {
        studyName: `Study ${studyMatch[1]}`,
        confidence: "medium",
        source: "Pattern matching in data",
      };
    }
    
    // Last resort: use timestamp
    return {
      studyName: `Study ${Date.now()}`,
      confidence: "low",
      source: "Timestamp fallback",
    };
  }
}

/**
 * Main function to rename folder with AI-detected study name
 */
export async function renameStudyFolderWithAI(
  originalFolderPath: string,
): Promise<string> {
  try {
    const result = await extractStudyNameWithAI(originalFolderPath);
    
    // If confidence is too low, keep original name
    if (result.confidence === "low") {
      console.log("⚠️  Low confidence in study name, keeping original folder name");
      return originalFolderPath;
    }
    
    // Create new folder path with detected study name
    const parentDir = path.dirname(originalFolderPath);
    const newFolderPath = path.join(parentDir, result.studyName);
    
    // If folder already exists with that name, add timestamp suffix
    let finalFolderPath = newFolderPath;
    if (fs.existsSync(newFolderPath) && newFolderPath !== originalFolderPath) {
      finalFolderPath = `${newFolderPath}_${Date.now()}`;
      console.log(`⚠️  Folder "${result.studyName}" exists, using: ${path.basename(finalFolderPath)}`);
    }
    
    // Rename folder if needed
    if (finalFolderPath !== originalFolderPath) {
      fs.renameSync(originalFolderPath, finalFolderPath);
      console.log(`✓ Folder renamed: ${path.basename(originalFolderPath)} → ${path.basename(finalFolderPath)}`);
      return finalFolderPath;
    }
    
    return originalFolderPath;
  } catch (error) {
    console.error("Error renaming folder with AI:", error);
    return originalFolderPath;
  }
}
