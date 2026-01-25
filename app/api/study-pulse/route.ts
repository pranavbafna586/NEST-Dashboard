import { NextRequest, NextResponse } from "next/server";
import { getStudyPulseMetrics } from "@/database/queries/study-pulse";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Fetch study pulse metrics
    const metrics = getStudyPulseMetrics(region, country, siteId, subjectId);

    return NextResponse.json({
      metrics,
      filters: {
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in study pulse API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch study pulse metrics",
        metrics: {
          pagesEntered: 0,
          totalQueries: 0,
          activeSubjects: 0,
          missingPages: 0,
          cleanCRFPercentage: 0,
        },
      },
      { status: 500 },
    );
  }
}
