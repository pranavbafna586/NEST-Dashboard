import { NextResponse } from "next/server";
import { getUniqueStudies } from "@/database/db";

export async function GET() {
  try {
    const studies = getUniqueStudies();
    return NextResponse.json({ studies });
  } catch (error) {
    console.error("Error in /api/studies:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies" },
      { status: 500 },
    );
  }
}
