/**
 * Country Performance API Endpoint
 * 
 * PURPOSE:
 * Aggregates performance metrics at the country level to identify geographic trends,
 * country-specific challenges, and regional differences in trial execution. Enables
 * geographic-based resource allocation and strategy adjustments.
 * 
 * BUSINESS CONTEXT - Geographic Performance Analysis:
 * Clinical trials span multiple countries, each with unique characteristics:
 * - Regulatory environments (FDA, EMA, PMDA, etc.)
 * - Healthcare infrastructure quality
 * - Language and cultural factors affecting data quality
 * - Economic conditions affecting retention rates
 * - Time zone challenges for global coordination
 * 
 * WHY COUNTRY-LEVEL ANALYSIS MATTERS:
 * 
 * 1. **Enrollment Planning**:
 *    - Some countries enroll faster due to larger patient populations
 *    - Identify countries that need enrollment support or should receive more slots
 *    - Understand seasonal patterns (e.g., winter enrollment drops in cold climates)
 * 
 * 2. **Quality Patterns**:
 *    - Language barriers may increase query rates in non-native English countries
 *    - Cultural factors affect dropout rates (stigma, family dynamics)
 *    - Healthcare documentation practices vary (impacts source data verification)
 * 
 * 3. **Regulatory Compliance**:
 *    - Different countries have different PI signature requirements
 *    - GDPR vs other data protection laws affect data handling
 *    - Local regulatory inspections drive compliance focus
 * 
 * 4. **Operational Efficiency**:
 *    - Data entry speed varies by country (infrastructure, training)
 *    - Query resolution time affected by time zones and communication
 *    - SAE reporting compliance varies by local regulatory requirements
 * 
 * TYPICAL COUNTRY METRICS:
 * - Total subjects enrolled per country
 * - Average query rate per subject
 * - Mean query response time
 * - Protocol deviation frequency
 * - Enrollment velocity (subjects/month)
 * - Dropout/discontinuation rates
 * - Data entry lag (days from visit to entry)
 * - Clean CRF percentage
 * 
 * USE CASES FOR COUNTRY COMPARISONS:
 * - "Why does Country X have 3x more queries than Country Y?"
 * - "Which countries need additional CRA support?"
 * - "Are enrollment targets realistic given country-specific challenges?"
 * - "Should we open more sites in high-performing countries?"
 * 
 * DATA SOURCE:
 * - Delegates to getCountryPerformanceSimplified query module
 * - Primary table: subject_level_metrics (aggregated by country)
 * - Excel Source: CPID_EDC_Metrics.xlsx (multiple sheets combined)
 * 
 * USE IN DASHBOARD:
 * Powers the "Country Performance Map" showing geographic heat map of performance
 * scores, with table view for detailed metric comparison across countries.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCountryPerformanceSimplified } from "@/database/queries/country-performance";

/**
 * GET /api/country-performance
 * 
 * Retrieves aggregated performance metrics grouped by country with optional filtering.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or omit for all studies
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or omit for all regions
 *   - country: Filter to specific country (for drill-down) or omit for all countries
 *   - siteId: Filter by specific site (allows country metrics for single site's country)
 *   - subjectId: Filter by subject (returns country metrics for that subject's country)
 * 
 * @returns JSON response with:
 *   - data: Array of country performance objects with enrollment, quality, compliance metrics
 *   - filters: Applied filter values for context
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

    /**
     * DELEGATION TO COUNTRY PERFORMANCE MODULE:
     * Complex geographic aggregations and metric calculations.
     * Module handles:
     * - Grouping by country from subject_level_metrics
     * - Calculating country-wide averages and totals
     * - Ranking countries by composite performance score
     * - Identifying statistical outliers requiring investigation
     */
    const data = getCountryPerformanceSimplified(
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
    console.error("Error in country performance API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch country performance metrics",
        data: [],
      },
      { status: 500 },
    );
  }
}
