import { NextRequest, NextResponse } from "next/server";
import { performRenaming } from "@/database/excelValidator";
import * as fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath, validationResult } = body;

    if (!folderPath || !validationResult) {
      return NextResponse.json(
        { error: "Folder path and validation result are required" },
        { status: 400 },
      );
    }

    // Validate that the folder exists
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Extract the actual validation object if it's wrapped
    const validation = validationResult.validation || validationResult;

    // Perform renaming
    const newFolderPath = await performRenaming(folderPath, validation);

    return NextResponse.json({
      success: true,
      message: "Files and folder renamed successfully",
      newFolderPath,
    });
  } catch (error) {
    console.error("Renaming error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
