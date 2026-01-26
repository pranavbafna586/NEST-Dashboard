import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFiles } from "@/database/validateUpload";
import * as path from "path";
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

    // Run validation
    const result = await validateUploadedFiles({
      uploadedFolderPath: folderPath,
      autoRename: false, // Don't auto-rename from API, let user confirm
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        validation: result.validation,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
