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

        // Get SAE distribution by team (DM vs Safety)
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

        const stmt = db.prepare(saeQuery);
        const results = stmt.all(...params);

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
