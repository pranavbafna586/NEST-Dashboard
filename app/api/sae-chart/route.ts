/**
 * SAE Chart Data API Endpoint
 * 
 * PURPOSE:
 * Provides flexible SAE (Serious Adverse Event) statistics with multiple breakdown dimensions
 * for comprehensive safety monitoring visualizations. Supports various grouping strategies
 * to analyze SAE data from different business perspectives.
 * 
 * BUSINESS CONTEXT - Multidimensional SAE Analysis:
 * SAE data needs to be analyzed from multiple angles to identify patterns, bottlenecks,
 * and safety signals. This endpoint provides 4 different breakdown dimensions:
 * 
 * 1. **CASE STATUS BREAKDOWN** (default):
 *    Groups SAEs by resolution stage:
 *    - Open: SAE reported, investigation ongoing
 *    - In Review: SAE under medical/DM assessment
 *    - Locked: SAE fully resolved and locked for submission
 *    - Closed: SAE completed but not yet locked
 *    
 *    Use case: Track SAE closure pipeline and backlog
 * 
 * 2. **REVIEW STATUS BREAKDOWN** (breakdown=review):
 *    Groups SAEs by review completion state:
 *    - Pending DM Review: Awaiting data management assessment
 *    - Pending Safety Review: Awaiting medical causality review
 *    - DM Review Complete: Data quality verified
 *    - Safety Review Complete: Medical assessment done
 *    - Both Reviews Complete: Ready for locking
 *    
 *    Use case: Identify which review team is the bottleneck
 * 
 * 3. **ACTION STATUS BREAKDOWN** (breakdown=action):
 *    Groups SAEs by required actions:
 *    - No action required: SAE fully resolved
 *    - Follow-up needed: Additional information pending
 *    - Query pending: Data clarification required
 *    - Documentation incomplete: Missing source documents
 *    
 *    Use case: Prioritize SAE-related tasks and workload
 * 
 * 4. **RESPONSIBLE FUNCTION BREAKDOWN** (breakdown=responsible):
 *    Groups SAEs by team ownership:
 *    - DM (Data Management): Data quality responsibility
 *    - Safety: Medical review responsibility
 *    - Site: Hospital reporting responsibility
 *    
 *    Use case: Workload distribution and resource allocation
 * 
 * SAFETY REPORTING REQUIREMENTS:
 * Different SAE types have different reporting timelines:
 * - Fatal SAEs: Report to authorities within 24 hours
 * - Life-threatening SAEs: Report within 48 hours
 * - Other serious SAEs: Report within 7-15 days
 * 
 * Delayed closure of SAE cases can:
 * - Delay regulatory submissions
 * - Obscure important safety signals
 * - Trigger regulatory findings during inspections
 * 
 * FILTERING CAPABILITIES:
 * Supports hierarchical filtering plus SAE-specific filters:
 * - Geographic: study, region, country, site, subject
 * - SAE-specific: reviewStatus, actionStatus filters for drill-down
 * 
 * DATA SOURCE:
 * - Delegates to sae-chart query module
 * - Primary table: sae_issues
 * - Excel Source: eSAE_Dashboard_Standard_DM_Safety_Report.xlsx
 * 
 * USE IN DASHBOARD:
 * Powers multiple SAE visualizations:
 * - SAE status pie charts
 * - Review funnel diagrams
 * - Action priority tables
 * - Team workload distribution charts
 */

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

    // Extract all filter parameters
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined; // Not used but accepted
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const reviewStatus = searchParams.get("reviewStatus") || undefined;
    const actionStatus = searchParams.get("actionStatus") || undefined;
    const breakdown = searchParams.get("breakdown") || undefined;

    /**
     * MULTI-DIMENSIONAL ROUTING:
     * Routes to different query functions based on requested breakdown dimension.
     * Each breakdown provides a different analytical perspective on SAE data.
     */

    // OPTION 1: Review Status Breakdown - Who needs to review?
    if (breakdown === "review") {
      const data = getSAEByReviewStatus(study, country, siteId, subjectId);
      return NextResponse.json({ data, breakdown: "review_status" });
    }

    // OPTION 2: Action Status Breakdown - What actions are needed?
    if (breakdown === "action") {
      const data = getSAEByActionStatus(study, country, siteId, subjectId);
      return NextResponse.json({ data, breakdown: "action_status" });
    }

    // OPTION 3: Responsible Function Breakdown - Which team owns it?
    if (breakdown === "responsible") {
      const data = getSAEByResponsibleFunction(
        study,
        country,
        siteId,
        subjectId,
      );
      return NextResponse.json({ data, breakdown: "responsible_lf" });
    }

    /**
     * DEFAULT: Case Status Breakdown - What stage is the SAE in?
     * Most common view showing SAE progression from open to locked.
     * Supports additional filtering by reviewStatus and actionStatus.
     */
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
