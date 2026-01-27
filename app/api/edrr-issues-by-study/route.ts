/**
 * EDRR Issues by Study API Endpoint
 * 
 * PURPOSE:
 * This endpoint provides statistics on External Data Reconciliation Report (EDRR) issues,
 * which are discrepancies between internal EDC (Electronic Data Capture) records and
 * external third-party data sources.
 * 
 * BUSINESS CONTEXT - What is EDRR?
 * EDRR = External Data Reconciliation Report
 * 
 * In clinical trials, data comes from multiple sources:
 * 1. Internal EDC: Data entered by hospital staff into the trial management system
 * 2. External Sources: Central labs, imaging centers, pharmacy systems, ECG vendors, etc.
 * 
 * These sources must match perfectly before regulatory submission. EDRR issues are
 * discrepancies that need investigation and resolution.
 * 
 * COMMON EDRR ISSUE EXAMPLES:
 * 1. Central Lab Mismatch:
 *    - Hospital EDC: "Blood sample collected on 2025-10-15"
 *    - Central Lab DB: "Sample received on 2025-10-17"
 *    - Issue: 2-day discrepancy - which date is correct?
 * 
 * 2. Pharmacy Discrepancy:
 *    - Hospital: "Patient received Drug X at 10:00 AM"
 *    - Pharmacy DB: "Drug X dispensed at 2:00 PM"
 *    - Issue: 4-hour discrepancy in timing
 * 
 * 3. Missing External Data:
 *    - Hospital: "ECG performed, no abnormalities"
 *    - External ECG company: "No ECG record found for this subject"
 *    - Issue: Data exists in one system but not the other
 * 
 * REGULATORY SIGNIFICANCE:
 * - All data sources must be reconciled before database lock (final freeze before analysis)
 * - Unresolved EDRR issues can delay regulatory submissions by months
 * - High EDRR counts indicate data quality or process problems that need correction
 * 
 * DATA SOURCE:
 * - Primary Table: edrr_issues
 * - Columns: project_name, subject_id, total_open_issue_count
 * - Excel Source: Compiled_EDRR.xlsx > OpenIssuesSummary sheet
 * 
 * USE IN DASHBOARD:
 * Powers the "EDRR Issues by Study" visualization showing which studies have the most
 * external data reconciliation problems and how many subjects are affected.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/edrr-issues-by-study
 * 
 * Retrieves EDRR issue statistics grouped by study with subject impact counts.
 * 
 * @param request - HTTP request with optional query parameter:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     byStudy: Array of studies with total_issues and subjects_affected,
 *     overall: Aggregate totals across all studies
 *   }
 */
export async function GET(request: Request) {
    try {
        // Extract study filter parameter
        // EDRR issues are typically analyzed at study level (not site/region)
        // since external vendors often serve entire studies, not individual sites
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");

        // Initialize SQLite database connection
        const db = getDatabase();

        // Build dynamic WHERE clause for study filtering
        const conditions: string[] = [];
        const params: any[] = [];

        if (study && study !== "ALL") {
            conditions.push("project_name = ?");
            params.push(study);
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        /**
         * QUERY 1: Get EDRR issues grouped by study
         * 
         * Aggregates:
         * - SUM(total_open_issue_count): Total unresolved discrepancies per study
         * - COUNT(DISTINCT subject_id): How many subjects have EDRR issues
         * 
         * Filter: Only include subjects with issues (total_open_issue_count > 0)
         * Subjects with 0 issues don't need action and clutter the report.
         * 
         * Order: DESC by total_issues to highlight studies with most problems first
         */
        const edrrQuery = `
      SELECT 
        project_name as study,
        SUM(total_open_issue_count) as total_issues,
        COUNT(DISTINCT subject_id) as subjects_affected
      FROM edrr_issues
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} total_open_issue_count > 0
      GROUP BY project_name
      ORDER BY total_issues DESC
    `;

        // Execute query to get per-study breakdown
        const stmt = db.prepare(edrrQuery);
        const studyResults = stmt.all(...params);

        /**
         * QUERY 2: Get overall totals across all studies
         * 
         * Same aggregation logic as Query 1, but without GROUP BY to get grand totals.
         * This provides summary statistics for KPI cards showing overall EDRR health.
         * 
         * Note: WHERE clause construction uses ternary to handle both cases:
         * - If whereClause exists: "WHERE project_name = 'Study 1' AND total_open_issue_count > 0"
         * - If empty: "WHERE total_open_issue_count > 0"
         */
        const totalQuery = `
      SELECT 
        SUM(total_open_issue_count) as total_issues,
        COUNT(DISTINCT subject_id) as subjects_affected
      FROM edrr_issues
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} total_open_issue_count > 0
    `;

        // Execute query to get overall totals
        const totalStmt = db.prepare(totalQuery);
        const totals = totalStmt.get(...params) as {
            total_issues: number;
            subjects_affected: number;
        };

        /**
         * RESPONSE STRUCTURE:
         * - byStudy: Array showing each study's EDRR burden (for detailed table/chart)
         * - overall: Grand totals for high-level KPI display
         * 
         * Default to 0 if null (e.g., no EDRR issues exist yet in the filtered scope)
         */
        return NextResponse.json({
            byStudy: studyResults,
            overall: {
                total_issues: totals.total_issues || 0,
                subjects_affected: totals.subjects_affected || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching EDRR issues:", error);
        return NextResponse.json(
            { error: "Failed to fetch EDRR issues data" },
            { status: 500 }
        );
    }
}
