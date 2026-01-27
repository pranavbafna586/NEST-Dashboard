/**
 * Site Performance API Endpoint
 * 
 * PURPOSE:
 * Compares performance metrics across all clinical sites to identify top performers
 * and underperforming sites needing support. Enables data-driven site management decisions.
 * 
 * BUSINESS CONTEXT - Why Site Performance Matters:
 * Clinical trials involve multiple hospital sites (typically 10-100+ sites globally).
 * Site performance varies dramatically based on:
 * - Staff experience and training
 * - Resource availability (coordinators, nurses, equipment)
 * - Patient population and enrollment challenges
 * - Geographic/cultural factors
 * - Principal Investigator engagement
 * 
 * Tracking site performance helps:
 * - Identify sites needing additional training or resources
 * - Recognize and reward top-performing sites
 * - Make enrollment allocation decisions (which sites get more patients?)
 * - Predict database lock readiness by site
 * - justify site termination if performance is consistently poor
 * 
 * KEY PERFORMANCE DIMENSIONS TRACKED:
 * 
 * 1. **Enrollment Metrics**:
 *    - Total subjects enrolled per site
 *    - Screen failure rate (screening/enrolled ratio)
 *    - Dropout/discontinuation rate
 *    - Enrollment velocity (subjects per month)
 * 
 * 2. **Data Quality Metrics**:
 *    - Query rate (queries per subject)
 *    - Query age distribution
 *    - Clean CRF percentage
 *    - Non-conformant pages count
 * 
 * 3. **Compliance Metrics**:
 *    - Protocol deviation rate
 *    - PI signature compliance
 *    - SDV completion rate
 *    - Missing visits/pages
 * 
 * 4. **Operational Metrics**:
 *    - Data entry timeliness (days from visit to data entry)
 *    - Query response time (days to resolution)
 *    - SAE reporting timeliness
 * 
 * SITE RANKING & BENCHMARKING:
 * Sites are typically ranked on composite scores across metrics:
 * - Green sites: Above average performance, minimal issues
 * - Yellow sites: Average performance, some areas need attention
 * - Red sites: Below average, require immediate intervention
 * 
 * INTERVENTION STRATEGIES:
 * Based on site performance data, study teams may:
 * - Schedule additional training sessions
 * - Increase CRA (monitor) visit frequency
 * - Provide dedicated data entry support staff
 * - Reduce enrollment targets if site is overloaded
 * - Initiate CAPA (Corrective and Preventive Action) plan
 * - In extreme cases, close underperforming sites
 * 
 * DATA SOURCE:
 * - Delegates to getSitePerformanceData query module
 * - Primary table: subject_level_metrics (aggregated by site_id)
 * - Excel Source: CPID_EDC_Metrics.xlsx (aggregated across multiple sheets)
 * 
 * USE IN DASHBOARD:
 * Powers the "Site Performance Comparison" table showing all sites ranked by
 * performance score, with drill-down capabilities to identify specific issues.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSitePerformanceData } from "@/database/queries/site-performance";

/**
 * GET /api/site-performance
 * 
 * Retrieves comparative performance metrics for all sites with optional filtering.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or omit for all studies
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or omit for all regions
 *   - country: Filter by country code (e.g., "USA", "FRA") or omit for all countries
 * 
 * @returns JSON response with array of site performance objects, each containing:
 *   - site_id, study, region, country
 *   - enrollment_metrics, data_quality_metrics, compliance_metrics
 *   - composite_performance_score
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    // Note: siteId filter not used here as we want to compare ALL sites
    // (filtering by single site would defeat the purpose of comparison)
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    /**
     * DELEGATION TO SITE PERFORMANCE MODULE:
     * Complex calculations for composite scoring across multiple dimensions.
     * Module handles:
     * - Multi-table aggregation by site_id
     * - Percentile ranking calculations
     * - Composite score computation with weighted metrics
     * - Outlier detection and flagging
     */
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
