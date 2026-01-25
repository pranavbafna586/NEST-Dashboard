import { NextRequest, NextResponse } from "next/server";
import { getCountryPerformanceSimplified } from "@/database/queries/country-performance";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Fetch country performance metrics
    const data = getCountryPerformanceSimplified(
      region,
      country,
      siteId,
      subjectId,
    );

    return NextResponse.json({
      data,
      filters: {
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in country performance API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch country performance metrics",
        data: [],
      },
      { status: 500 },
    );
  }
}
