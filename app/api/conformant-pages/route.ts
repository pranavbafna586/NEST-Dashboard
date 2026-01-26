import { NextResponse } from "next/server";
import { getDatabase } from "@/database/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const study = searchParams.get("study");
        const region = searchParams.get("region");
        const country = searchParams.get("country");
        const siteId = searchParams.get("siteId");

        const db = getDatabase();

        // Build WHERE clause based on filters
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

        // Get conformant pages by study
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

        const stmt = db.prepare(conformantQuery);
        const results = stmt.all(...params);

        // Calculate overall totals
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
