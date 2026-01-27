/**
 * Study Pulse Metrics API Endpoint
 * 
 * PURPOSE:
 * Provides a real-time "health check" of study operational metrics aggregating key
 * performance indicators for data entry progress, query workload, subject activity,
 * and data quality. Similar to vitals monitoring in medicine - quick snapshot of study health.
 * 
 * BUSINESS CONTEXT - Study Pulse Metrics:
 * Study Pulse is a simplified dashboard showing the most critical metrics study teams
 * check daily to ensure the trial is progressing smoothly. It answers:
 * - "Is data being entered?"
 * - "Are there too many pending queries?"
 * - "How many subjects are actively participating?"
 * - "Are there data quality issues?"
 * 
 * KEY METRICS PROVIDED:
 * 
 * 1. **Pages Entered**: Total CRF (Case Report Form) pages with data
 *    - Tracks data entry productivity
 *    - Declining trend indicates sites falling behind
 *    - Useful for capacity planning and site support prioritization
 * 
 * 2. **Total Queries**: Count of open data quality questions
 *    - Higher count indicates data quality issues or communication problems
 *    - Trend shows if query workload is under control or growing
 *    - Critical for database lock timeline estimation
 * 
 * 3. **Active Subjects**: Count of subjects currently "On Trial" or in "Follow-Up"
 *    - Indicates ongoing workload (visits, data entry, monitoring)
 *    - Declining count may signal study winding down or dropout issues
 *    - Used for resource allocation and scheduling
 * 
 * 4. **Missing Pages**: Forms that should exist but haven't been entered
 *    - Protocol-required visits that sites haven't documented
 *    - Red flag for protocol compliance and data completeness
 *    - Directly impacts database lock readiness
 * 
 * 5. **Clean CRF Percentage**: Proportion of forms with no queries or issues
 *    - Data quality indicator (higher is better)
 *    - Target typically: 80-90% clean CRF rate
 *    - Below 70% indicates systemic data quality problems
 *    - Used to measure site performance and training effectiveness
 * 
 * OPERATIONAL USE CASES:
 * - Daily stand-ups: Quick study health assessment
 * - Weekly metrics reviews: Track trends over time
 * - Management dashboards: Executive-level KPIs
 * - Site performance reviews: Compare sites against study averages
 * 
 * FILTERING CAPABILITIES:
 * Supports hierarchical drill-down from global view to individual subject level:
 * - Study-wide: All studies combined
 * - Single study: One trial's metrics
 * - Region: Geographic performance (e.g., EMEA vs APAC)
 * - Country: Country-specific performance
 * - Site: Individual hospital/clinic metrics
 * - Subject: Patient 360° view (for subject-level analysis)
 * 
 * DATA SOURCE:
 * - Delegates to getStudyPulseMetrics query module
 * - Primary table: subject_level_metrics
 * - Aggregates data from query_report for query counts
 * - Excel Source: CPID_EDC_Metrics.xlsx (multiple sheets combined)
 * 
 * USE IN DASHBOARD:
 * Powers the "Study Pulse" widget showing 5 KPI cards with current values,
 * trends (up/down arrows), and color indicators (green/yellow/red) based on
 * predefined thresholds.
 */

import { NextRequest, NextResponse } from "next/server";
import { getStudyPulseMetrics } from "@/database/queries/study-pulse";

/**
 * GET /api/study-pulse
 * 
 * Retrieves real-time study health metrics across data entry, queries, and subject activity.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or omit for all studies
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or omit for all regions
 *   - country: Filter by country code (e.g., "USA", "FRA") or omit for all countries
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or omit for all sites
 *   - subjectId: Filter to single subject (for patient 360° view) or omit for aggregate
 * 
 * @returns JSON response with metrics object containing:
 *   - pagesEntered: Total CRF pages with data
 *   - totalQueries: Open query count
 *   - activeSubjects: Subjects on trial or in follow-up
 *   - missingPages: Protocol-required pages not yet entered
 *   - cleanCRFPercentage: Percentage of forms with no issues
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract all hierarchical filter parameters
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    /**
     * DELEGATION TO STUDY PULSE MODULE:
     * Metric calculations are complex and involve multiple table joins.
     * Delegated to @/database/queries/study-pulse module for:
     * - Clean separation of concerns (API vs business logic)
     * - Easier testing of calculation logic
     * - Reusability across different endpoints
     */
    const metrics = getStudyPulseMetrics(
      study,
      region,
      country,
      siteId,
      subjectId,
    );

    // Return metrics with applied filters for context
    return NextResponse.json({
      metrics,
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in study pulse API:", error);
    // Return safe defaults on error to prevent dashboard breakage
    return NextResponse.json(
      {
        error: "Failed to fetch study pulse metrics",
        metrics: {
          pagesEntered: 0,
          totalQueries: 0,
          activeSubjects: 0,
          missingPages: 0,
          cleanCRFPercentage: 0,
        },
      },
      { status: 500 },
    );
  }
}
