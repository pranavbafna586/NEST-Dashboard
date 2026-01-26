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

    // Get total unique subjects count
    const totalQuery = `
      SELECT COUNT(DISTINCT subject_id) as totalSubjects
      FROM subject_level_metrics
      ${whereClause}
    `;
    const totalStmt = db.prepare(totalQuery);
    const totalResult = totalStmt.get(...params) as { totalSubjects: number };

    // Get subject status counts
    const statusQuery = `
      SELECT 
        subject_status,
        COUNT(DISTINCT subject_id) as count
      FROM subject_level_metrics
      ${whereClause}
      GROUP BY subject_status
    `;

    const stmt = db.prepare(statusQuery);
    const statusResults = stmt.all(...params) as Array<{
      subject_status: string;
      count: number;
    }>;

    // Map status counts
    const statusMap: { [key: string]: number } = {};
    statusResults.forEach((row) => {
      if (row.subject_status) {
        statusMap[row.subject_status] = row.count;
      }
    });

    // Calculate funnel stages
    const screening = statusMap["Screening"] || 0;
    const screenFailure = statusMap["Screen Failure"] || 0;
    const enrolled = statusMap["Enrolled"] || 0;
    const onTrial = statusMap["On Trial"] || 0;
    const followUp = statusMap["Follow-Up"] || 0;
    const survival = statusMap["Survival"] || 0;
    const completed = statusMap["Completed"] || 0;
    const discontinued = statusMap["Discontinued"] || 0;

    // Funnel calculation (progressive stages)
    const totalCompleted = completed + survival;

    const funnelData = [
      { stage: "Screening", count: screening, percentage: 100 },
      {
        stage: "Enrolled",
        count: enrolled,
        percentage:
          screening > 0 ? Math.round((enrolled / screening) * 100) : 0,
      },
      {
        stage: "On Trial",
        count: onTrial,
        percentage: enrolled > 0 ? Math.round((onTrial / enrolled) * 100) : 0,
      },
      {
        stage: "Follow-Up",
        count: followUp,
        percentage: onTrial > 0 ? Math.round((followUp / onTrial) * 100) : 0,
      },
      {
        stage: "Completed",
        count: totalCompleted,
        percentage:
          followUp > 0 ? Math.round((totalCompleted / followUp) * 100) : 0,
      },
    ];

    return NextResponse.json({
      funnel: funnelData,
      excluded: {
        screenFailure,
        discontinued,
      },
      totals: {
        totalSubjects: totalResult.totalSubjects,
        activeSubjects: onTrial + followUp,
      },
    });
  } catch (error) {
    console.error("Error fetching subject enrollment status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject enrollment data" },
      { status: 500 },
    );
  }
}
