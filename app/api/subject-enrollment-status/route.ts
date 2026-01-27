/**
 * Subject Enrollment Status API Endpoint
 * 
 * PURPOSE:
 * This endpoint provides enrollment funnel statistics showing how subjects (patients) progress
 * through the clinical trial lifecycle from initial screening to study completion.
 * 
 * BUSINESS CONTEXT:
 * Clinical trial enrollment follows a strict funnel process:
 * 1. Screening: Initial evaluation to determine eligibility
 * 2. Enrolled: Passed screening and officially joined the study
 * 3. On Trial: Actively receiving treatment/intervention
 * 4. Follow-Up: Treatment completed, monitoring for long-term effects
 * 5. Completed: Finished all required follow-up visits
 * 
 * At each stage, subjects may exit due to:
 * - Screen Failure: Did not meet inclusion/exclusion criteria
 * - Discontinued: Withdrew early (side effects, relocation, personal choice, etc.)
 * 
 * REGULATORY SIGNIFICANCE:
 * Enrollment and retention metrics are critical for:
 * - Study timeline projections and resource planning
 * - Statistical power calculations (sufficient sample size)
 * - Identifying site-specific enrollment challenges
 * - Regulatory submissions showing subject accountability
 * 
 * DATA SOURCE:
 * - Primary Table: subject_level_metrics
 * - Column: subject_status (possible values: "Screening", "Screen Failure", "Enrolled", 
 *   "On Trial", "Follow-Up", "Completed", "Survival", "Discontinued")
 * - Excel Source: Subject Level Metrics sheet, derived from SV (Subject Visits) tab
 * 
 * USE IN DASHBOARD:
 * Powers the "Subject Enrollment Funnel" visualization showing conversion rates at each
 * stage and identifying where subjects are dropping out.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/subject-enrollment-status
 * 
 * Retrieves subject enrollment funnel data with stage-wise progression and dropout statistics.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     funnel: Array of enrollment stages with counts and conversion percentages,
 *     excluded: Counts of subjects who exited (screenFailure, discontinued),
 *     totals: Overall subject counts (totalSubjects, activeSubjects)
 *   }
 */
export async function GET(request: Request) {
  try {
    // Extract filter parameters from query string for hierarchical drill-down
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study");
    const region = searchParams.get("region");
    const country = searchParams.get("country");
    const siteId = searchParams.get("siteId");

    // Initialize SQLite database connection
    const db = getDatabase();

    // Build dynamic WHERE clause based on active filters (same pattern as query-distribution)
    const conditions: string[] = [];
    const params: any[] = [];

    if (study && study !== "ALL") {
      conditions.push("project_name = ?");
      params.push(study);
    }
    if (region && region !== "ALL") {
      conditions.push("region = ?");
      params.push(region);
    }
    if (country && country !== "ALL") {
      conditions.push("country = ?");
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      conditions.push("site_id = ?");
      params.push(siteId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    /**
     * QUERY 1: Get total unique subjects in the filtered scope
     * This provides the baseline for calculating enrollment funnel conversion rates.
     * Uses DISTINCT to avoid counting the same subject multiple times if they appear
     * in multiple rows (though subject_level_metrics typically has one row per subject).
     */
    const totalQuery = `
      SELECT COUNT(DISTINCT subject_id) as totalSubjects
      FROM subject_level_metrics
      ${whereClause}
    `;
    const totalStmt = db.prepare(totalQuery);
    const totalResult = totalStmt.get(...params) as { totalSubjects: number };

    /**
     * QUERY 2: Group subjects by enrollment status
     * subject_status column contains values like "Screening", "On Trial", "Completed", etc.
     * This aggregation shows how many subjects are at each stage of the trial.
     */
    const statusQuery = `
      SELECT 
        subject_status,
        COUNT(DISTINCT subject_id) as count
      FROM subject_level_metrics
      ${whereClause}
      GROUP BY subject_status
    `;

    const stmt = db.prepare(statusQuery);
    const statusResults = stmt.all(...params) as Array<{
      subject_status: string;
      count: number;
    }>;

    // Convert query results into key-value map for easy lookup
    // This allows us to access counts by status name (e.g., statusMap["On Trial"])
    const statusMap: { [key: string]: number } = {};
    statusResults.forEach((row) => {
      if (row.subject_status) {
        statusMap[row.subject_status] = row.count;
      }
    });

    /**
     * ENROLLMENT FUNNEL CALCULATION:
     * Extract counts for each stage in the enrollment lifecycle.
     * Default to 0 if status doesn't exist in the data (e.g., no subjects at that stage yet).
     * 
     * STATUS DEFINITIONS (from database/detailed_data.txt):
     * - Screening: Initial evaluation phase
     * - Screen Failure: Did not qualify for the study
     * - Enrolled: Passed screening, officially joined
     * - On Trial: Actively receiving treatment
     * - Follow-Up: Treatment done, monitoring long-term effects
     * - Survival: Long-term survival follow-up (cancer trials)
     * - Completed: All visits finished
     * - Discontinued: Stopped early (adverse events, withdrawal, lost to follow-up)
     */
    const screening = statusMap["Screening"] || 0;
    const screenFailure = statusMap["Screen Failure"] || 0;
    const enrolled = statusMap["Enrolled"] || 0;
    const onTrial = statusMap["On Trial"] || 0;
    const followUp = statusMap["Follow-Up"] || 0;
    const survival = statusMap["Survival"] || 0;
    const completed = statusMap["Completed"] || 0;
    const discontinued = statusMap["Discontinued"] || 0;

    /**
     * FUNNEL VISUALIZATION DATA:
     * Each stage shows:
     * - count: Number of subjects currently at or who passed this stage
     * - percentage: Conversion rate from previous stage
     * 
     * Percentage calculations:
     * - Screening baseline: Always 100% (starting point)
     * - Enrolled: (enrolled / screening) × 100 - what % passed screening?
     * - On Trial: (onTrial / enrolled) × 100 - what % started treatment?
     * - Follow-Up: (followUp / onTrial) × 100 - what % completed treatment?
     * - Completed: (totalCompleted / followUp) × 100 - what % finished all visits?
     * 
     * Note: totalCompleted combines "Completed" + "Survival" statuses as both
     * represent successfully finished subjects (some trials track survival separately)
     */
    const totalCompleted = completed + survival;

    const funnelData = [
      { stage: "Screening", count: screening, percentage: 100 },
      {
        stage: "Enrolled",
        count: enrolled,
        percentage:
          screening > 0 ? Math.round((enrolled / screening) * 100) : 0,
      },
      {
        stage: "On Trial",
        count: onTrial,
        percentage: enrolled > 0 ? Math.round((onTrial / enrolled) * 100) : 0,
      },
      {
        stage: "Follow-Up",
        count: followUp,
        percentage: onTrial > 0 ? Math.round((followUp / onTrial) * 100) : 0,
      },
      {
        stage: "Completed",
        count: totalCompleted,
        percentage:
          followUp > 0 ? Math.round((totalCompleted / followUp) * 100) : 0,
      },
    ];

    /**
     * RESPONSE STRUCTURE:
     * - funnel: Progressive stages with conversion rates for visualization
     * - excluded: Subjects who exited the trial (not counted in funnel progression)
     * - totals: Aggregate metrics for KPI cards (total enrolled, currently active)
     * 
     * Active subjects = On Trial + Follow-Up (still participating in the study)
     */
    return NextResponse.json({
      funnel: funnelData,
      excluded: {
        screenFailure,
        discontinued,
      },
      totals: {
        totalSubjects: totalResult.totalSubjects,
        activeSubjects: onTrial + followUp,
      },
    });
  } catch (error) {
    console.error("Error fetching subject enrollment status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject enrollment data" },
      { status: 500 },
    );
  }
}
