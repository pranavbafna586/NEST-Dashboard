import { NextResponse } from "next/server";
import { getUniqueRegions } from "@/database/queries/sidebar-filters";

export async function GET() {
  try {
    const regions = getUniqueRegions();
    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error in /api/regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 },
    );
  }
}
