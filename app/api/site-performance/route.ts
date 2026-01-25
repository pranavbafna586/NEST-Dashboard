import { NextRequest, NextResponse } from "next/server";
import { getSitePerformanceData } from "@/database/queries/site-performance";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    const data = getSitePerformanceData(study, region, country);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in site-performance API:", error);
    return NextResponse.json(
      { error: "Failed to fetch site performance data" },
      { status: 500 },
    );
  }
}
