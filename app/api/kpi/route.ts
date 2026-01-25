import { NextResponse } from "next/server";
import { getKPISummaryWithTrends } from "@/database/queries/kpi-summary";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Get KPI summary with all trends
    const data = getKPISummaryWithTrends(region, country, siteId, subjectId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/kpi:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 },
    );
  }
}
