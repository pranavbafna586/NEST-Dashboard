import { NextRequest, NextResponse } from "next/server";
import { getSubjectOverviewData } from "@/database/queries/subject-overview";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    const data = getSubjectOverviewData(
      study,
      region,
      country,
      siteId,
      subjectId,
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in subject-overview API:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject overview data" },
      { status: 500 },
    );
  }
}
