import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFiles } from "@/database/validateUpload";
import { importExcelToDatabase } from "@/database/importToDatabase";
import * as fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath } = body;

    if (!folderPath) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 },
      );
    }

    // Validate that the folder exists
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Extract study name from folder path (e.g., "Study 11" from path)
    const folderName = folderPath.split(/[/\\]/).pop() || "Study 1";

    // Import to database
    const importResult = await importExcelToDatabase(folderPath, folderName);

    if (importResult.success) {
      return NextResponse.json({
        success: true,
        message: "Data imported to database successfully",
        databasePath: importResult.databasePath,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: importResult.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Database import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
