/**
 * Protocol Deviation Details API Endpoint
 * 
 * PURPOSE:
 * This endpoint provides statistics on protocol deviations (PDs), which are instances
 * where the clinical trial procedures deviated from the approved study protocol.
 * 
 * BUSINESS CONTEXT - What is a Protocol Deviation?
 * In clinical trials, every procedure must follow the exact protocol approved by regulatory
 * authorities (FDA, EMA, etc.) and ethics committees. A protocol deviation occurs when
 * the approved procedures are not followed, even if unintentional.
 * 
 * PROTOCOL DEVIATION EXAMPLES:
 * 1. Timing Violations:
 *    - Protocol: "Patient must visit Week 4 ± 3 days"
 *    - Actual: Patient came 10 days late
 *    - Deviation: Outside acceptable visit window
 * 
 * 2. Dosing Errors:
 *    - Protocol: "Administer 50mg daily"
 *    - Actual: Doctor prescribed 100mg by mistake
 *    - Deviation: Incorrect dose administered
 * 
 * 3. Eligibility Issues:
 *    - Protocol: "Exclude patients with diabetes"
 *    - Actual: Patient enrolled but had diabetes (found later)
 *    - Deviation: Inclusion/exclusion criteria violation
 * 
 * 4. Procedure Errors:
 *    - Protocol: "Blood draw must be fasting (8 hours)"
 *    - Actual: Patient had breakfast 2 hours before
 *    - Deviation: Procedure not followed correctly
 * 
 * 5. Consent Issues:
 *    - Protocol: "Obtain written consent before any procedures"
 *    - Actual: Consent signed after first blood draw
 *    - Deviation: GCP (Good Clinical Practice) violation
 * 
 * DEVIATION STATUS TYPES:
 * - PD Proposed: Potential deviation identified, under investigation
 * - PD Confirmed: Investigation complete, officially documented as deviation
 * 
 * REGULATORY SIGNIFICANCE:
 * - Minor deviations (e.g., 1-day visit delay): Documented but usually acceptable
 * - Major deviations (e.g., wrong dose, wrong patient enrolled): Can invalidate subject's data
 * - Too many deviations: Raises red flags about site quality and study integrity
 * - Regulators review all deviations during approval process
 * - Patterns of deviations can lead to site suspension or study termination
 * 
 * DATA SOURCE:
 * - Primary Table: protocol_deviation
 * - Columns: project_name, region, country, site_id, subject_id, pd_status, visit_date
 * - Excel Source: CPID_EDC_Metrics.xlsx > Protocol Deviation sheet
 * 
 * USE IN DASHBOARD:
 * Powers the "Protocol Deviation Tracking" visualization showing deviation burden by study,
 * helping identify sites with quality issues and track resolution progress.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/protocol-deviation-details
 * 
 * Retrieves protocol deviation statistics grouped by study with status breakdown.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     byStudy: Array of studies with confirmed/proposed deviation counts,
 *     overall: Grand totals across all studies
 *   }
 */
export async function GET(request: Request) {
    try {
        // Extract filter parameters from query string
        // Protocol deviations can be analyzed at multiple levels: study, region, country, site
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");
        const region = searchParams.get("region");
        const country = searchParams.get("country");
        const siteId = searchParams.get("siteId");

        // Initialize SQLite database connection
        const db = getDatabase();

        // Build dynamic WHERE clause for hierarchical filtering
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
         * PROTOCOL DEVIATION QUERY:
         * Uses SQL CASE statements for conditional counting to separate deviation types.
         * 
         * CASE WHEN pd_status = 'PD Confirmed' THEN 1 ELSE 0 END:
         * - Returns 1 for confirmed deviations, 0 for others
         * - SUM() adds up all the 1s = count of confirmed deviations
         * 
         * This technique allows counting both statuses in a single query instead of
         * running separate queries for each status type.
         * 
         * GROUP BY project_name: Separate counts for each study
         * ORDER BY total DESC: Show studies with most deviations first
         * 
         * DATA MAPPING (from database/tables_mapping.txt):
         * - PDs Confirmed: count of PDs having pd_status as "PD Confirmed"
         * - PDs Proposed: count of PDs having pd_status as "PD Proposed"
         */
        const pdQuery = `
      SELECT 
        project_name as study,
        SUM(CASE WHEN pd_status = 'PD Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN pd_status = 'PD Proposed' THEN 1 ELSE 0 END) as proposed,
        COUNT(*) as total
      FROM protocol_deviation
      ${whereClause}
      GROUP BY project_name
      ORDER BY total DESC
    `;

        // Execute query to get per-study breakdown
        const stmt = db.prepare(pdQuery);
        const studyResults = stmt.all(...params);

        /**
         * OVERALL TOTALS QUERY:
         * Same logic as per-study query but without GROUP BY to get grand totals.
         * Useful for KPI cards showing "Total Confirmed Deviations" across entire portfolio.
         */
        const totalQuery = `
      SELECT 
        SUM(CASE WHEN pd_status = 'PD Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN pd_status = 'PD Proposed' THEN 1 ELSE 0 END) as proposed,
        COUNT(*) as total
      FROM protocol_deviation
      ${whereClause}
    `;

        const totalStmt = db.prepare(totalQuery);
        const totals = totalStmt.get(...params) as {
            confirmed: number;
            proposed: number;
            total: number;
        };

        /**
         * RESPONSE STRUCTURE:
         * - byStudy: Detailed breakdown showing each study's deviation profile
         * - overall: Summary statistics for high-level dashboard metrics
         * 
         * High confirmed counts indicate quality issues that need site training/intervention.
         * High proposed counts indicate active investigation - may become confirmed later.
         */

        return NextResponse.json({
            byStudy: studyResults,
            overall: {
                confirmed: totals.confirmed || 0,
                proposed: totals.proposed || 0,
                total: totals.total || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching protocol deviation details:", error);
        return NextResponse.json(
            { error: "Failed to fetch protocol deviation data" },
            { status: 500 }
        );
    }
}
