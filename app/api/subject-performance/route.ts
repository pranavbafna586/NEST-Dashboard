/**
 * Subject Performance API Endpoint
 * 
 * PURPOSE:
 * Analyzes subject-level performance metrics to identify subjects with data quality issues,
 * compliance problems, or exceptional performance characteristics. Enables subject-by-subject
 * comparison and outlier detection.
 * 
 * BUSINESS CONTEXT - Why Subject Performance Matters:
 * Not all subjects have equal data quality. Some subjects may have:
 * - Exceptional data quality (zero queries, 100% clean CRF, perfect compliance)
 * - Problematic data (high query count, many deviations, missing pages)
 * - Early discontinuation risk indicators (missed visits, non-compliance patterns)
 * 
 * ANALYZING SUBJECT PERFORMANCE HELPS:
 * - Identify subjects requiring extra monitoring or intervention
 * - Recognize patterns predicting discontinuation risk
 * - Compare subject data quality within a site
 * - Flag subjects whose data may impact primary endpoint analysis
 * - Prioritize query resolution efforts (focus on subjects with most queries)
 * 
 * KEY SUBJECT PERFORMANCE METRICS:
 * 
 * 1. **Data Quality Score**:
 *    - Clean CRF percentage (higher = better)
 *    - Total open queries (lower = better)
 *    - Non-conformant pages (lower = better)
 * 
 * 2. **Compliance Indicators**:
 *    - Protocol deviations count
 *    - Missed visits count
 *    - Missing pages count
 * 
 * 3. **CompletionProgress**:
 *    - Pages entered vs. expected
 *    - Visit completion rate
 *    - On-track for database lock?
 * 
 * 4. **Engagement Metrics**:
 *    - Visit adherence (coming to appointments on time)
 *    - Data entry lag (time from visit to data entry)
 *    - Query response time (site responsiveness to queries)
 * 
 * OUTLIER IDENTIFICATION:
 * Subjects with extreme values (very high queries, very low completion):
 * - May indicate site training issues
 * - Could signal subject non-compliance
 * - Might reveal protocol complexity problems
 * - May require safety monitoring intensification
 * 
 * DATA SOURCE:
 * - Delegates to getSubjectPerformance query module
 * - Primary table: subject_level_metrics
 * - Excel Source: CPID_EDC_Metrics.xlsx > Subject Level Metrics sheet
 * 
 * USE IN DASHBOARD:
 * Powers subject comparison tables, scatter plots showing subject performance distribution,
 * and outlier flagging visualizations.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSubjectPerformance } from "@/database/queries/subject-performance";

/**
 * GET /api/subject-performance
 * 
 * Retrieves subject-level performance metrics for comparison and outlier detection.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter subjects to specified study
 *   - region: Filter subjects to specified region
 *   - country: Filter subjects to specified country
 *   - siteId: Filter subjects to specified site
 *   - subjectId: Filter to single subject
 * 
 * @returns JSON response:
 *   {
 *     data: Array of subject performance objects with quality scores and metrics
 *     filters: Applied filter values
 *   }
 */
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
