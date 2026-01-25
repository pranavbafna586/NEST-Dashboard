import { NextResponse } from "next/server";
import { getUniqueSites } from "@/database/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    const sites = getUniqueSites(region, country);
    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error in /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 },
    );
  }
}
