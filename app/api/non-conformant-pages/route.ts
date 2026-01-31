import { NextResponse } from "next/server";
import {
  getNonConformantPagesMetrics,
  getNonConformantPagesByStudy,
  getNonConformantPagesBySite,
} from "@/database/queries/non-conformant-pages-metrics";

/**
 * GET /api/non-conformant-pages
 * 
 * Retrieves non-conformant pages statistics grouped by study and site.
 * Non-conformant pages are data pages that violate protocol rules.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 *   - subjectId: Filter by subject ID
 * 
 * @returns JSON response:
 *   {
 *     summary: { totalNonConformantPages: number },
 *     byStudy: Array of studies with non-conformant page counts,
 *     bySite: Array of top 10 sites with highest non-conformant page counts
 *   }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    const summary = getNonConformantPagesMetrics(
      study,
      region,
      country,
      siteId,
      subjectId
    );
    const byStudy = getNonConformantPagesByStudy(
      study,
      region,
      country,
      siteId,
      subjectId
    );
    const bySite = getNonConformantPagesBySite(
      study,
      region,
      country,
      siteId,
      subjectId
    );

    return NextResponse.json({
      summary,
      byStudy,
      bySite,
    });
  } catch (error) {
    console.error("Error fetching non-conformant pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch non-conformant pages data" },
      { status: 500 }
    );
  }
}
