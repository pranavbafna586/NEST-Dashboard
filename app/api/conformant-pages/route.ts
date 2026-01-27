/**
 * Conformant Pages API Endpoint
 * 
 * PURPOSE:
 * Tracks data conformance to protocol rules, identifying pages that violate edit checks,
 * consistency rules, or protocol specifications. Critical quality metric for database lock readiness.
 * 
 * BUSINESS CONTEXT - What are Non-Conformant Pages?
 * In clinical trials, each data entry form (CRF page) must pass automated validation rules:
 * 
 * 1. **Edit Checks**: Logical rules enforcing data integrity
 *    Example: "Systolic BP must be > Diastolic BP"
 *    Example: "End date must be >= Start date"
 * 
 * 2. **Range Checks**: Values within acceptable medical/protocol limits
 *    Example: "Heart rate must be between 40-200 bpm"
 *    Example: "Age must be 18-85 years per inclusion criteria"
 * 
 * 3. **Consistency Rules**: Data must agree across forms
 *    Example: "Adverse event start date must be after informed consent date"
 *    Example: "Dose administered must match randomization assignment"
 * 
 * 4. **Required Fields**: Protocol-mandated data points
 *    Example: "Concomitant medication name cannot be blank"
 *    Example: "Visit date is required for all assessments"
 * 
 * NON-CONFORMANT PAGE = Page failing one or more validation rules
 * 
 * WHY NON-CONFORMANCE MATTERS:
 * - Cannot lock database with non-conformant data
 * - Indicates potential protocol deviations
 * - Suggests site training gaps
 * - Red flag for regulatory audits
 * - Delays statistical analysis and submissions
 * 
 * TARGET METRICS:
 * - **Good**: < 5% pages non-conformant
 * - **Acceptable**: 5-10% pages non-conformant
 * - **Poor**: > 10% pages non-conformant (requires intervention)
 * 
 * CLEAN CRF PERCENTAGE:
 * Inverse metric - percentage of pages WITH NO issues:
 * - clean_crf = (conformant_pages / total_pages) × 100
 * - Higher percentage = better data quality
 * - Target: 90%+ clean CRF rate for database lock
 * 
 * COMMON CAUSES OF NON-CONFORMANCE:
 * - Insufficient site training on CRF completion
 * - Complex/confusing edit check logic
 * - Source document quality issues
 * - Retrospective data entry (increases errors)
 * - Tight timelines causing rushed data entry
 * 
 * DATA SOURCE:
 * - Primary Table: subject_level_metrics
 * - Columns: pages_entered, pages_non_conformant, percentage_clean_crf
 * - Excel Source: CPID_EDC_Metrics.xlsx > Subject Level Metrics sheet
 * 
 * USE IN DASHBOARD:
 * Powers the "Data Conformance Quality" visualization showing conformance rates
 * by study, with drill-down to identify sites/subjects with quality issues.
 */

import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

/**
 * GET /api/conformant-pages
 * 
 * Retrieves data conformance statistics grouped by study with overall totals.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by clinical trial (e.g., "Study 1") or "ALL"
 *   - region: Filter by geographic region (e.g., "EMEA", "ASIA") or "ALL"
 *   - country: Filter by country code (e.g., "USA", "FRA") or "ALL"
 *   - siteId: Filter by specific hospital site (e.g., "Site 1") or "ALL"
 * 
 * @returns JSON response:
 *   {
 *     byStudy: Array of studies with total_pages, conformant_pages, non_conformant_pages, avg_clean_percentage
 *     overall: Grand totals with percentage calculation
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
         * CONFORMANCE METRICS BY STUDY:
         * Aggregates page counts and calculates data quality indicators:
         * 
         * - SUM(pages_entered): Total CRF pages with data
         * - SUM(pages_non_conformant): Pages failing validation rules
         * - Calculated conformant_pages: pages_entered - pages_non_conformant
         * - AVG(percentage_clean_crf): Average clean rate across all subjects
         * 
         * GROUP BY project_name: Compare conformance rates across studies
         * ORDER BY avg_clean_percentage DESC: Best quality studies first
         */
        const conformantQuery = `
      SELECT 
        project_name as study,
        SUM(pages_entered) as total_pages,
        SUM(pages_non_conformant) as non_conformant_pages,
        SUM(pages_entered) - SUM(pages_non_conformant) as conformant_pages,
        ROUND(AVG(percentage_clean_crf), 2) as avg_clean_percentage
      FROM subject_level_metrics
      ${whereClause}
      GROUP BY project_name
      ORDER BY avg_clean_percentage DESC
    `;

        // Execute query to get per-study breakdown
        const stmt = db.prepare(conformantQuery);
        const results = stmt.all(...params);

        /**
         * OVERALL TOTALS QUERY:
         * Calculates grand totals across all studies for high-level KPI.
         * 
         * Used for dashboard summary cards showing portfolio-wide data quality.
         */
        const totalQuery = `
      SELECT 
        SUM(pages_entered) as total_pages,
        SUM(pages_non_conformant) as non_conformant_pages,
        SUM(pages_entered) - SUM(pages_non_conformant) as conformant_pages
      FROM subject_level_metrics
      ${whereClause}
    `;

        const totalStmt = db.prepare(totalQuery);
        const totals = totalStmt.get(...params) as {
            total_pages: number;
            non_conformant_pages: number;
            conformant_pages: number;
        };

        /**
         * OVERALL PERCENTAGE CALCULATION:
         * Percentage of conformant pages across entire filtered dataset.
         * 
         * Formula: (conformant_pages / total_pages) × 100
         * 
         * This gives a single quality score for executive dashboards.
         */
        const overallPercentage = totals.total_pages > 0
            ? Math.round((totals.conformant_pages / totals.total_pages) * 100)
            : 0;

        return NextResponse.json({
            byStudy: results,
            overall: {
                total_pages: totals.total_pages || 0,
                conformant_pages: totals.conformant_pages || 0,
                non_conformant_pages: totals.non_conformant_pages || 0,
                percentage: overallPercentage,
            },
        });
    } catch (error) {
        console.error("Error fetching conformant pages:", error);
        return NextResponse.json(
            { error: "Failed to fetch conformant pages data" },
            { status: 500 }
        );
    }
}
