/**
 * SAE Distribution API Endpoint
 * 
 * PURPOSE:
 * Tracks distribution of Serious Adverse Events (SAEs) by responsible team and case status.
 * Shows workload split between Data Management and Safety teams for SAE review and resolution.
 * 
 * BUSINESS CONTEXT - What is an SAE?
 * SAE = Serious Adverse Event
 * An adverse event that results in any of the following outcomes:
 * - Death
 * - Life-threatening condition
 * - Hospitalization (initial or prolonged)
 * - Permanent disability or significant incapacity
 * - Congenital anomaly/birth defect
 * - Important medical events requiring intervention
 * 
 * REGULATORY SIGNIFICANCE:
 * SAEs are the highest priority safety signals in clinical trials:
 * - Must be reported to regulatory authorities within 24-48 hours
 * - Require detailed documentation and causality assessment
 * - Pattern of SAEs can halt or terminate a trial
 * - Incomplete SAE documentation blocks regulatory approval
 * - FDA/EMA closely scrutinize SAE handling during inspections
 * 
 * DUAL TEAM REVIEW PROCESS:
 * SAEs require review by TWO independent teams:
 * 
 * 1. **Data Management (DM) Team**:
 *    - Ensures SAE forms are complete and accurate
 *    - Checks consistency with other data sources (EDC, source documents)
 *    - Validates dates, outcomes, and follow-up requirements
 *    - Focus: Data quality and completeness
 * 
 * 2. **Safety Team**:
 *    - Assesses medical causality (related to study drug?)
 *    - Determines reportability to authorities
 *    - Tracks ongoing SAE outcomes and follow-up
 *    - Identifies safety signals and patterns
 *    - Focus: Medical evaluation and regulatory reporting
 * 
 * CASE STATUS CATEGORIES:
 * SAE cases are categorized by resolution status:
 * 
 * **CLOSED**: Fully resolved cases
 *    - case_status IN ('Locked', 'Closed')
 *    - action_status = 'No action required'
 *    - All documentation complete, reviewed, and finalized
 *    - No further action needed
 * 
 * **OPEN**: Cases requiring attention
 *    - Awaiting DM review (data quality issues)
 *    - Awaiting Safety review (medical assessment pending)
 *    - Follow-up information needed
 *    - Discrepancies to resolve
 * 
 * WORKLOAD BALANCING:
 * This endpoint helps identify:
 * - Backlog concentration (which team is overwhelmed?)
 * - Case closure rates (are SAEs being resolved promptly?)
 * - Team-specific bottlenecks requiring resource allocation
 * 
 * TYPICAL WORKFLOW:
 * 1. Site reports SAE (within 24 hours of awareness)
 * 2. DM team reviews for data completeness → open until complete
 * 3. Safety team performs medical review → open until assessed
 * 4. Both teams close their review → case becomes fully closed
 * 5. Locked cases are finalized and included in regulatory submissions
 * 
 * DATA SOURCE:
 * - Primary Table: sae_issues
 * - Columns: project_name, responsible_lf (team), case_status, action_status
 * - Excel Source: eSAE_Dashboard_Standard_DM_Safety_Report.xlsx (two tabs: DM and Safety)
 * 
 * USE IN DASHBOARD:
 * Powers the "SAE Distribution by Team" visualization showing open vs. closed case counts
 * for DM and Safety teams, highlighting review backlogs requiring attention.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/sae-distribution
 * 
 * Retrieves SAE distribution statistics grouped by responsible team with case status breakdown.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     data: Array of team-wise case counts (team, closed, open)
 *   }
 */
export async function GET(request: Request) {
    try {
        // Extract filter parameters for hierarchical drill-down
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");
        const region = searchParams.get("region");
        const country = searchParams.get("country");
        const siteId = searchParams.get("siteId");

        // Initialize database connection
        const db = getDatabase();

        // Build dynamic WHERE clause for filtering
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
         * SAE CASE STATUS LOGIC:
         * This query categorizes SAE cases as CLOSED or OPEN based on dual criteria:
         * 
         * CLOSED CASES:
         * Must meet BOTH conditions:
         * 1. case_status IN ('Locked', 'Closed') - Case finalized in system
         * 2. AND action_status = 'No action required' - No pending tasks
         * 
         * OPEN CASES:
         * Any case that doesn't meet both closed criteria:
         * - case_status is 'Open' or NULL
         * - OR action_status indicates pending work
         * 
         * TEAM ASSIGNMENT (responsible_lf):
         * - 'DM' (Data Management): Data quality review
         * - 'Safety': Medical safety assessment
         * Comes from eSAE Dashboard Excel file with separate tabs for each team
         * 
         * GROUP BY responsible_lf: Separate statistics for DM and Safety teams
         * This reveals which team has the heavier SAE review burden
         */
        const saeQuery = `
      SELECT 
        responsible_lf as team,
        SUM(CASE 
          WHEN (case_status IN ('Locked', 'Closed') AND action_status = 'No action required')
          THEN 1 ELSE 0 
        END) as closed,
        SUM(CASE 
          WHEN NOT (case_status IN ('Locked', 'Closed') AND action_status = 'No action required')
          THEN 1 ELSE 0 
        END) as open
      FROM sae_issues
      ${whereClause}
      GROUP BY responsible_lf
    `;

        // Execute query with filter parameters
        const stmt = db.prepare(saeQuery);
        const results = stmt.all(...params);

        /**
         * RESPONSE FORMAT:
         * Each row represents one team's SAE workload:
         * - team: 'DM' or 'Safety'
         * - closed: Count of fully resolved SAE cases
         * - open: Count of SAE cases still requiring review/action
         * 
         * High open counts indicate review backlog requiring prioritization.
         */
        return NextResponse.json({
            data: results,
        });
    } catch (error) {
        console.error("Error fetching SAE distribution:", error);
        return NextResponse.json(
            { error: "Failed to fetch SAE distribution" },
            { status: 500 }
        );
    }
}
