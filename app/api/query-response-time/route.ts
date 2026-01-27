/**
 * Query Response Time API Endpoint
 * 
 * PURPOSE:
 * Analyzes age distribution of outstanding data queries by review team, showing how long
 * queries have been waiting for resolution. Critical for identifying response bottlenecks
 * and ensuring queries don't age beyond acceptable Service Level Agreements (SLAs).
 * 
 * BUSINESS CONTEXT:
 * Query response time directly impacts study timelines. Aged queries indicate:
 * - Sites struggling to access source documents
 * - Review teams overwhelmed with workload
 * - Communication breakdowns between stakeholders
 * - Potential data quality issues that will delay database lock
 * 
 * TIME BUCKET CATEGORIES:
 * Queries are grouped into aging buckets based on days_since_open:
 * 
 * 1. **Week 1 (< 7 days)**: Fresh queries, within normal response window
 *    - Status: ✅ Green - Acceptable aging
 *    - Action: Routine follow-up
 * 
 * 2. **Week 2 (7-14 days)**: Approaching SLA threshold
 *    - Status: ⚠️ Yellow - Monitor closely
 *    - Action: Remind query owners
 * 
 * 3. **Month 1 (15-30 days)**: Overdue queries
 *    - Status: ⚠️ Orange - Requires escalation
 *    - Action: Manager intervention needed
 * 
 * 4. **Over 30 days (> 30 days)**: Severely aged queries
 *    - Status: 🔴 Red - Critical aging issue
 *    - Action: Executive escalation, may block database lock
 * 
 * TEAM-WISE ANALYSIS:
 * Queries categorized by responsible team (from marking_group_name and action_owner):
 * - **DM (Data Management)**: System-generated and DM review queries
 * - **Clinical**: Clinical review team queries
 * - **Medical**: Medical review team queries
 * - **Site**: Hospital/research site action items
 * - **Field Monitor**: CRA (Clinical Research Associate) queries from site visits
 * - **Safety**: Safety review team queries
 * - **Other**: Uncategorized queries
 * 
 * REGULATORY SIGNIFICANCE:
 * - FDA/EMA audits check query resolution times
 * - Aged queries indicate potential data quality issues
 * - Pattern of slow response at specific sites may trigger inspection
 * - Query backlog can delay trial timelines by months
 * 
 * TYPICAL SLA THRESHOLDS:
 * - Site queries: Respond within 5 business days
 * - DM queries: Respond within 10 business days
 * - Safety queries: Respond within 24-48 hours (urgent)
 * 
 * DATA SOURCE:
 * - Primary Table: query_report
 * - Columns: marking_group_name, action_owner, days_since_open, project_name, region, country, site_id
 * - Excel Source: CPID_EDC_Metrics.xlsx > Query Report - Cumulative sheet
 * 
 * USE IN DASHBOARD:
 * Powers the "Query Aging by Team" visualization showing heat map of response times,
 * helping identify which teams need workload balancing or additional resources.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/query-response-time
 * 
 * Retrieves query aging distribution grouped by review team with time bucket breakdown.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     data: Array of team-wise time bucket counts (week1, week2, month1, over30, total)
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
         * QUERY AGING ANALYSIS:
         * This query performs two key operations:
         * 
         * 1. TEAM CATEGORIZATION (CASE statement):
         *    Maps marking_group_name and action_owner to standardized team names.
         *    Multiple source values map to single team (e.g., 'DM Review' + 'DM from System' → 'DM')
         * 
         * 2. TIME BUCKET AGGREGATION (SUM with CASE):
         *    Counts queries in each aging category using conditional logic:
         *    - week1: Fresh queries (< 7 days old)
         *    - week2: Approaching SLA (7-14 days)
         *    - month1: Overdue (15-30 days)
         *    - over30: Critically aged (> 30 days)
         * 
         * The pattern SUM(CASE WHEN condition THEN 1 ELSE 0 END) counts rows matching condition.
         * This is more efficient than separate queries for each time bucket.
         * 
         * GROUP BY team: Separate statistics for each review team
         * ORDER BY total DESC: Show teams with most queries first (workload priority)
         */
        const responseTimeQuery = `
      SELECT 
        CASE
          WHEN marking_group_name IN ('DM Review', 'DM from System') THEN 'DM'
          WHEN marking_group_name = 'Clinical Review' THEN 'Clinical'
          WHEN marking_group_name = 'Medical Review' THEN 'Medical'
          WHEN marking_group_name = 'Site Review' OR action_owner = 'Site Action' THEN 'Site'
          WHEN marking_group_name = 'Field Monitor Review' OR action_owner = 'CRA Action' THEN 'Field Monitor'
          WHEN marking_group_name = 'Safety Review' THEN 'Safety'
          ELSE 'Other'
        END as team,
        SUM(CASE WHEN days_since_open < 7 THEN 1 ELSE 0 END) as week1,
        SUM(CASE WHEN days_since_open BETWEEN 7 AND 14 THEN 1 ELSE 0 END) as week2,
        SUM(CASE WHEN days_since_open BETWEEN 15 AND 30 THEN 1 ELSE 0 END) as month1,
        SUM(CASE WHEN days_since_open > 30 THEN 1 ELSE 0 END) as over30,
        COUNT(*) as total
      FROM query_report
      ${whereClause}
      GROUP BY team
      ORDER BY total DESC
    `;

        // Execute the query with filter parameters
        const stmt = db.prepare(responseTimeQuery);
        const results = stmt.all(...params);

        /**
         * RESPONSE FORMAT:
         * Each row contains:
         * - team: Review team name
         * - week1, week2, month1, over30: Query counts in each aging bucket
         * - total: Total queries for this team
         * 
         * Results ordered by total (descending) to highlight biggest backlogs first.
         */
        return NextResponse.json({
            data: results,
        });
    } catch (error) {
        console.error("Error fetching query response time:", error);
        return NextResponse.json(
            { error: "Failed to fetch query response time data" },
            { status: 500 }
        );
    }
}
