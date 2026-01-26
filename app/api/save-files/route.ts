import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";
import os from "os";

// Helper to extract study number from Excel file names
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

// Helper to wait for file to be accessible
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

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

    return NextResponse.json({
      success: true,
      folderPath: uploadDir,
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
