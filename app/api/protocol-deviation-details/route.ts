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

        // Get protocol deviation by study and status
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

        const stmt = db.prepare(pdQuery);
        const studyResults = stmt.all(...params);

        // Get overall totals
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
