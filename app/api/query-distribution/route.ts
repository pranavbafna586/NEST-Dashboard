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

        // Get query distribution by team
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

        const distribution = [
            { team: "Data Management", count: result.dm_queries || 0, color: "#3b82f6" },
            { team: "Clinical Review", count: result.clinical_queries || 0, color: "#8b5cf6" },
            { team: "Medical Review", count: result.medical_queries || 0, color: "#ec4899" },
            { team: "Site", count: result.site_queries || 0, color: "#f59e0b" },
            { team: "Field Monitor", count: result.field_monitor_queries || 0, color: "#10b981" },
            { team: "Medical Coding", count: result.coding_queries || 0, color: "#6366f1" },
            { team: "Safety", count: result.safety_queries || 0, color: "#ef4444" },
        ].filter(item => item.count > 0);

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
