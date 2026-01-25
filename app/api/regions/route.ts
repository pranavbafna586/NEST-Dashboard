import { NextResponse } from "next/server";
import { getUniqueRegions } from "@/database/queries/sidebar-filters";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;

    const regions = getUniqueRegions(study);
    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error in /api/regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 },
    );
  }
}
