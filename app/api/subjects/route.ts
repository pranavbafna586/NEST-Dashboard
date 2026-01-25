import { NextResponse } from "next/server";
import { getUniqueSubjects } from "@/database/queries/sidebar-filters";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    const subjects = getUniqueSubjects(study, siteId, region, country);
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error in /api/subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
