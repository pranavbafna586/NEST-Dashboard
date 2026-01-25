import { NextRequest, NextResponse } from "next/server";
import {
  getSignatureComplianceData,
  getSignatureComplianceSummary,
} from "@/database/queries/signature-compliance";

/**
 * GET /api/signature-compliance
 * Returns signature compliance data with optional filters
 *
 * Query Parameters:
 * - study: Project/study name filter
 * - region: Region filter
 * - country: Country filter
 * - siteId: Site ID filter
 * - subjectId: Subject ID filter
 * - summary: If "true", returns summary statistics instead of detailed breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const summary = searchParams.get("summary") === "true";

    // If summary is requested, return summary statistics
    if (summary) {
      const summaryData = getSignatureComplianceSummary(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      return NextResponse.json({
        summary: summaryData,
        filters: {
          study: study || "ALL",
          region: region || "ALL",
          country: country || "ALL",
          siteId: siteId || "ALL",
          subjectId: subjectId || "ALL",
        },
      });
    }

    // Return detailed breakdown
    const data = getSignatureComplianceData(
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
    console.error("Error in signature compliance API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch signature compliance data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
