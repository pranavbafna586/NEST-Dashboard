import { NextRequest, NextResponse } from "next/server";
import {
  getSAEChartData,
  getSAEByReviewStatus,
  getSAEByActionStatus,
  getSAEByResponsibleFunction,
} from "@/database/queries/sae-chart";

/**
 * GET /api/sae-chart
 * Returns SAE chart data grouped by case_status with optional filters
 *
 * Query Parameters:
 * - study: Project/study name filter
 * - region: Region filter (not used in sae_issues table, but kept for consistency)
 * - country: Country filter
 * - siteId: Site ID filter
 * - subjectId: Subject ID filter
 * - reviewStatus: Review status filter
 * - actionStatus: Action status filter
 * - breakdown: Optional breakdown type (review, action, responsible)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined; // Not used but accepted
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const reviewStatus = searchParams.get("reviewStatus") || undefined;
    const actionStatus = searchParams.get("actionStatus") || undefined;
    const breakdown = searchParams.get("breakdown") || undefined;

    // If breakdown type is specified, return that breakdown
    if (breakdown === "review") {
      const data = getSAEByReviewStatus(study, country, siteId, subjectId);
      return NextResponse.json({ data, breakdown: "review_status" });
    }

    if (breakdown === "action") {
      const data = getSAEByActionStatus(study, country, siteId, subjectId);
      return NextResponse.json({ data, breakdown: "action_status" });
    }

    if (breakdown === "responsible") {
      const data = getSAEByResponsibleFunction(
        study,
        country,
        siteId,
        subjectId,
      );
      return NextResponse.json({ data, breakdown: "responsible_lf" });
    }

    // Default: return case_status breakdown with filters
    const data = getSAEChartData(
      study,
      region,
      country,
      siteId,
      subjectId,
      reviewStatus,
      actionStatus,
    );

    return NextResponse.json({
      data,
      breakdown: "case_status",
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
        reviewStatus: reviewStatus || "ALL",
        actionStatus: actionStatus || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in SAE chart API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch SAE chart data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
