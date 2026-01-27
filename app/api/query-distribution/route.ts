/**
 * Query Distribution API Endpoint
 * 
 * PURPOSE:
 * This endpoint provides aggregate statistics on clinical trial data queries distributed
 * across different review teams. Queries are questions raised about data quality issues
 * that need clarification or correction (e.g., "Blood pressure shows 500/300 - is this a typo?").
 * 
 * BUSINESS CONTEXT:
 * In clinical trials, multiple specialized teams review data for different purposes:
 * - Data Management (DM): Checks data entry accuracy and completeness
 * - Clinical Review: Validates medical consistency and safety signals
 * - Medical Review: Deep dive on efficacy and safety outcomes
 * - Site Teams: Hospital staff responding to queries about their data
 * - Field Monitors: On-site inspectors comparing EDC data to source documents
 * - Medical Coding: Standardizing medical terms (e.g., MedDRA, WHODD)
 * - Safety: Focused review of serious adverse events
 * 
 * DATA SOURCE:
 * - Primary Table: subject_level_metrics (aggregates from Query Report - Cumulative Excel sheet)
 * - Columns: dm_queries, clinical_queries, medical_queries, site_queries, 
 *           field_monitor_queries, coding_queries, safety_queries, total_queries
 * 
 * USE IN DASHBOARD:
 * Powers the "Query Distribution by Team" visualization showing which teams have the
 * most outstanding queries, helping to identify workload bottlenecks.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/query-distribution
 * 
 * Retrieves query distribution statistics across all review teams with optional filtering.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     distribution: Array of team-wise query counts with colors,
 *     total: Overall total query count across all teams
 *   }
 */
export async function GET(request: Request) {
    try {
        // Extract filter parameters from query string
        // These allow dashboard users to drill down from global view to specific studies/sites
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");
        const region = searchParams.get("region");
        const country = searchParams.get("country");
        const siteId = searchParams.get("siteId");

        // Initialize SQLite database connection to edc_metrics.db
        const db = getDatabase();

        // Build dynamic WHERE clause based on active filters
        // Filters cascade: Study > Region > Country > Site for hierarchical drill-down
        const conditions: string[] = [];
        const params: any[] = [];

        // Add filter conditions only if specific values are provided (not "ALL")
        // Uses parameterized queries to prevent SQL injection
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

        // Construct WHERE clause by joining all active conditions with AND
        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        /**
         * QUERY AGGREGATION LOGIC:
         * Sum all query counts across subjects within the filtered scope.
         * Each subject in subject_level_metrics has pre-calculated query counts by team type.
         * 
         * DATA MAPPING (from database/tables_mapping.txt):
         * - dm_queries: Queries under "DM Review" OR "DM from System" in Query Report - Cumulative
         * - clinical_queries: Queries under "Clinical Review"
         * - medical_queries: Queries under "Medical Review"
         * - site_queries: Count of queries in Query Report - Site Action OR "Site Review"
         * - field_monitor_queries: Count from Query Report - CRA Action OR "Field Monitor Review"
         * - coding_queries: Count of uncoded medical terms needing standardization
         * - safety_queries: Queries under "Safety Review"
         * - total_queries: Sum of all query types for overall workload tracking
         */
        const queryQuery = `
      SELECT 
        SUM(dm_queries) as dm_queries,
        SUM(clinical_queries) as clinical_queries,
        SUM(medical_queries) as medical_queries,
        SUM(site_queries) as site_queries,
        SUM(field_monitor_queries) as field_monitor_queries,
        SUM(coding_queries) as coding_queries,
        SUM(safety_queries) as safety_queries,
        SUM(total_queries) as total_queries
      FROM subject_level_metrics
      ${whereClause}
    `;

        // Execute the parameterized query with filter values
        const stmt = db.prepare(queryQuery);
        const result = stmt.get(...params) as {
            dm_queries: number;
            clinical_queries: number;
            medical_queries: number;
            site_queries: number;
            field_monitor_queries: number;
            coding_queries: number;
            safety_queries: number;
            total_queries: number;
        };

        /**
         * FORMAT RESPONSE DATA:
         * Transform aggregated counts into visualization-ready format with:
         * - team: Human-readable team name for display
         * - count: Number of outstanding queries for this team
         * - color: Hex color code for consistent dashboard visualization
         * 
         * Color scheme follows dashboard theme (blue for DM, purple for clinical, 
         * pink for medical, orange for site, green for monitors, indigo for coding, red for safety)
         * 
         * Filter out teams with zero queries to keep visualization clean
         */
        const distribution = [
            { team: "Data Management", count: result.dm_queries || 0, color: "#3b82f6" },
            { team: "Clinical Review", count: result.clinical_queries || 0, color: "#8b5cf6" },
            { team: "Medical Review", count: result.medical_queries || 0, color: "#ec4899" },
            { team: "Site", count: result.site_queries || 0, color: "#f59e0b" },
            { team: "Field Monitor", count: result.field_monitor_queries || 0, color: "#10b981" },
            { team: "Medical Coding", count: result.coding_queries || 0, color: "#6366f1" },
            { team: "Safety", count: result.safety_queries || 0, color: "#ef4444" },
        ].filter(item => item.count > 0); // Remove teams with no queries

        return NextResponse.json({
            distribution,
            total: result.total_queries || 0,
        });
    } catch (error) {
        console.error("Error fetching query distribution:", error);
        return NextResponse.json(
            { error: "Failed to fetch query distribution" },
            { status: 500 }
        );
    }
}
