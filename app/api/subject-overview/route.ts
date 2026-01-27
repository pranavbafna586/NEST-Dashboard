/**
 * Subject Overview API Endpoint
 * 
 * PURPOSE:
 * Provides aggregate statistics about subjects for tabular display and overview visualizations.
 * Returns subject-level summaries suitable for list views and comparison tables.
 * 
 * BUSINESS CONTEXT:
 * When viewing multiple subjects (e.g., all subjects at a site), users need summary information
 * to quickly assess each subject's status without drilling into full Patient 360° detail.
 * 
 * TYPICAL DATA PROVIDED:
 * - Subject ID, study, site, region, country
 * - Current status (Screening, Enrolled, On Trial, etc.)
 * - Enrollment date, last visit date
 * - Data completeness (pages entered vs. expected)
 * - Query count (open data quality issues)
 * - Protocol deviations count
 * - Clean CRF percentage (data quality score)
 * 
 * USE CASES:
 * - Site coordinator viewing all their subjects in a table
 * - Data manager identifying subjects with high query counts
 * - Monitor identifying subjects with missing visits
 * - Study manager reviewing subject status distribution
 * 
 * vs. PATIENT-360:
 * - Subject Overview: List view with summary stats for MULTIPLE subjects
 * - Patient-360: Detailed single-subject view with ALL data points
 * 
 * DATA SOURCE:
 * - Delegates to getSubjectOverviewData query module
 * - Primary table: subject_level_metrics
 * - Excel Source: CPID_EDC_Metrics.xlsx > Subject Level Metrics sheet
 * 
 * USE IN DASHBOARD:
 * Powers subject tables showing filterable, sortable lists of subjects with key metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSubjectOverviewData } from "@/database/queries/subject-overview";

/**
 * GET /api/subject-overview
 * 
 * Retrieves subject summary data for table/list view.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter subjects to specified study
 *   - region: Filter subjects to specified region
 *   - country: Filter subjects to specified country
 *   - siteId: Filter subjects to specified site
 *   - subjectId: Filter to single subject (returns 1 row)
 * 
 * @returns JSON response: { data: Array of subject summary objects }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Fetch subject overview data with filtering
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
