import { NextRequest, NextResponse } from "next/server";
import { getSubjectPerformance } from "@/database/queries/subject-performance";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Fetch subject performance metrics
    const data = getSubjectPerformance(
      study,
      region,
      country,
      siteId,
      subjectId,
    );

    return NextResponse.json({
      data,
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in subject performance API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subject performance metrics",
        data: [],
      },
      { status: 500 },
    );
  }
}
