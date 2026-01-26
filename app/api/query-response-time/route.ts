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

        // Get query response time distribution by team
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

        const stmt = db.prepare(responseTimeQuery);
        const results = stmt.all(...params);

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
