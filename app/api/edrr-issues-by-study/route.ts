import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");

        const db = getDatabase();

        // Build WHERE clause based on filters
        const conditions: string[] = [];
        const params: any[] = [];

        if (study && study !== "ALL") {
            conditions.push("project_name = ?");
            params.push(study);
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Get EDRR issues by study
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

        const stmt = db.prepare(edrrQuery);
        const studyResults = stmt.all(...params);

        // Get overall totals
        const totalQuery = `
      SELECT 
        SUM(total_open_issue_count) as total_issues,
        COUNT(DISTINCT subject_id) as subjects_affected
      FROM edrr_issues
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} total_open_issue_count > 0
    `;

        const totalStmt = db.prepare(totalQuery);
        const totals = totalStmt.get(...params) as {
            total_issues: number;
            subjects_affected: number;
        };

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
