/**
 * KPI Summary API Endpoint
 * 
 * PURPOSE:
 * Central endpoint providing a comprehensive dashboard of Key Performance Indicators (KPIs)
 * for clinical trial monitoring. Aggregates critical metrics across data quality, enrollment,
 * compliance, and safety dimensions with time-based trend analysis.
 * 
 * BUSINESS CONTEXT:
 * KPIs are the primary metrics used by stakeholders to assess study health at-a-glance.
 * This endpoint consolidates data from multiple tables to provide executive-level visibility
 * into trial performance without requiring deep dive into individual reports.
 * 
 * KEY KPI CATEGORIES:
 * 1. **Enrollment Metrics**:
 *    - Total subjects screened, enrolled, active, completed
 *    - Enrollment velocity (subjects per month)
 *    - Dropout/discontinuation rates
 * 
 * 2. **Data Quality Metrics**:
 *    - Total open queries by type (DM, Clinical, Medical, Site, Safety)
 *    - Query age distribution (% > 30 days, > 60 days, > 90 days)
 *    - Non-conformant pages (data that breaks protocol rules)
 *    - Clean CRF percentage (forms with no queries or issues)
 * 
 * 3. **Compliance Metrics**:
 *    - Protocol deviations (confirmed vs. proposed)
 *    - Signature compliance (% forms signed within SLA)
 *    - SDV (Source Data Verification) completion rate
 *    - CRF lock status (forms finalized vs. still editable)
 * 
 * 4. **Safety Metrics**:
 *    - Open SAE (Serious Adverse Event) reviews
 *    - EDRR (External Data Reconciliation) issues
 *    - Missing lab data entries
 * 
 * 5. **Operational Metrics**:
 *    - Missing visits (subjects overdue for appointments)
 *    - Missing pages (incomplete data entry)
 *    - Data entry velocity (pages entered per week)
 * 
 * TREND ANALYSIS:
 * The endpoint includes time-based trends for each KPI, allowing stakeholders to:
 * - Identify improving vs. deteriorating metrics
 * - Predict future bottlenecks before they become critical
 * - Measure impact of corrective actions (e.g., site training)
 * 
 * FILTERING CAPABILITIES:
 * Supports hierarchical filtering to drill down into specific issues:
 * - Study level: Compare performance across multiple trials
 * - Region level: Identify geographic challenges (e.g., EMEA vs. ASIA)
 * - Country level: Pinpoint country-specific regulatory or cultural issues
 * - Site level: Identify underperforming hospitals needing support
 * - Subject level: Review individual patient data quality
 * 
 * DATA SOURCE:
 * Aggregates from multiple tables via kpi-summary query module:
 * - subject_level_metrics (primary source for most KPIs)
 * - query_report (query aging and distribution)
 * - sae_issues (safety event tracking)
 * - pi_signature_report (signature compliance)
 * - sdv (source data verification status)
 * - protocol_deviation (compliance tracking)
 * - edrr_issues (external data reconciliation)
 * 
 * USE IN DASHBOARD:
 * Powers the main dashboard KPI cards showing real-time study health metrics
 * with color-coded indicators (green/yellow/red) and trend arrows (↑↓→).
 */

import { NextResponse } from "next/server";
import { getKPISummaryWithTrends } from "@/database/queries/kpi-summary";

/**
 * GET /api/kpi
 * 
 * Retrieves comprehensive KPI summary with trend analysis across all clinical trial dimensions.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or omit for all studies
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or omit for all regions
 *   - country: Filter by country code (e.g., "USA", "FRA") or omit for all countries
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or omit for all sites
 *   - subjectId: Filter to single subject (for patient 360° view) or omit for aggregate
 * 
 * @returns JSON response with KPI values, trends, and metadata for visualization
 */
export async function GET(request: Request) {
  try {
    // Extract all filter parameters from query string
    // All parameters are optional - omitting a filter means "ALL" for that dimension
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    /**
     * DELEGATION TO KPI SUMMARY MODULE:
     * Complex KPI calculations are handled in @/database/queries/kpi-summary
     * to keep API endpoint lean and testable. The module:
     * 1. Executes multiple SQL queries across different tables
     * 2. Calculates derived metrics (percentages, ratios, velocities)
     * 3. Computes time-based trends (comparing current vs. historical values)
     * 4. Formats response with color indicators and thresholds
     */
    const data = getKPISummaryWithTrends(
      study,
      region,
      country,
      siteId,
      subjectId,
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/kpi:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 },
    );
  }
}
