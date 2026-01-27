/**
 * Regional Data Entry Progress API Endpoint
 * 
 * PURPOSE:
 * Provides hierarchical drill-down view of data entry progress from global view down to
 * individual sites, automatically adjusting aggregation level based on selected filters.
 * Enables geographic analysis of data entry productivity and bottlenecks.
 * 
 * BUSINESS CONTEXT - Hierarchical Data Entry Monitoring:
 * Clinical trials generate massive amounts of data that must be entered into the EDC system:
 * - Subject visits with vital signs, lab results, adverse events
 * - Concomitant medications, medical history, physical exams
 * - Protocol-specific assessments and questionnaires
 * 
 * Data entry workload varies by geography:
 * - Different regions have different healthcare documentation practices
 * - Language barriers affect data entry speed and accuracy
 * - Resource availability (data coordinators) varies by country
 * - Time zones affect coordination and support availability
 * 
 * ADAPTIVE HIERARCHICAL AGGREGATION:
 * This endpoint intelligently adjusts its aggregation level based on filters:
 * 
 * 1. **NO FILTERS or STUDY ONLY** → REGION-LEVEL VIEW:
 *    - Shows: EMEA, APAC, Americas regions
 *    - Use case: Executive dashboard showing global distribution
 *    - Helps identify: Which regions are lagging in data entry?
 * 
 * 2. **REGION SELECTED** → COUNTRY-LEVEL VIEW:
 *    - Shows: Countries within selected region (e.g., USA, Canada, Mexico)
 *    - Use case: Regional manager drilling into their territory
 *    - Helps identify: Which countries in my region need support?
 * 
 * 3. **COUNTRY SELECTED** → SITE-LEVEL VIEW:
 *    - Shows: Individual hospital sites in selected country
 *    - Use case: Country lead identifying specific problem sites
 *    - Helps identify: Which sites are overwhelmed or underperforming?
 * 
 * KEY METRICS PROVIDED (at each level):
 * - **Total Pages Entered**: Volume of data captured
 * - **Pages Expected**: Protocol-required pages based on enrollment
 * - **Completion Percentage**: (entered / expected) × 100
 * - **Missing Pages**: Expected pages not yet entered (data gaps)
 * - **Entry Velocity**: Pages per week (trend analysis)
 * 
 * DATA ENTRY BENCHMARKS:
 * - **Good**: 90%+ completion, < 10% missing pages
 * - **Acceptable**: 80-90% completion
 * - **Poor**: < 80% completion (indicates backlog or resource issues)
 * 
 * OPERATIONAL USE CASES:
 * - Identify regions/countries needing additional data entry staff
 * - Predict database lock timeline based on current velocity
 * - Allocate CRA resources to sites with highest missing page counts
 * - Compare productivity across geographies for training insights
 * 
 * DATA SOURCE:
 * - Delegates to regional-data-entry query module
 * - Primary table: subject_level_metrics
 * - Aggregations: getRegionalDataEntryProgress, getCountryDataEntryProgress, getSiteDataEntryProgress
 * - Excel Source: CPID_EDC_Metrics.xlsx > Subject Level Metrics sheet
 * 
 * USE IN DASHBOARD:
 * Powers the "Data Entry Progress by Region" interactive drill-down table/map,
 * allowing users to click through from global → region → country → site views.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRegionalDataEntryProgress,
  getCountryDataEntryProgress,
  getSiteDataEntryProgress,
} from "@/database/queries/regional-data-entry";

/**
 * GET /api/regional-data-entry
 * 
 * Retrieves data entry progress with adaptive aggregation level based on filters.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or omit for all studies
 *   - region: Filter by geographic region - triggers country-level aggregation
 *   - country: Filter by country - triggers site-level aggregation
 *   - siteId: Filter by site (included in site-level view)
 *   - subjectId: Filter by subject (included in site-level calculation)
 * 
 * @returns JSON response:
 *   {
 *     data: Array of progress objects (region/country/site depending on filter)
 *     level: "region" | "country" | "site" (indicates aggregation level)
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

    /**
     * ADAPTIVE AGGREGATION LOGIC:
     * Determines appropriate drill-down level based on selected filters.
     * 
     * Hierarchy: Region → Country → Site
     * 
     * The most specific filter determines the aggregation level:
     * - Country selected → show sites (finest granularity)
     * - Region selected (no country) → show countries
     * - No geographic filter → show regions (highest level)
     */
    let data;
    let level;

    // If country is selected, show site-level breakdown
    if (country && country !== "ALL") {
      data = getSiteDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "site";
    }
    // If region is selected (but not country), show country-level breakdown
    else if (region && region !== "ALL") {
      data = getCountryDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "country";
    }
    // Otherwise, show region-level breakdown
    else {
      data = getRegionalDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "region";
    }

    return NextResponse.json({
      data,
      level,
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in regional data entry API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch regional data entry progress",
        data: [],
        level: "region",
      },
      { status: 500 },
    );
  }
}
