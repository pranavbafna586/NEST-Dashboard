/**
 * DQI Metrics API Endpoint
 * 
 * PURPOSE:
 * Provides aggregate Data Quality Index (DQI) metrics across filtered subjects.
 * Shows average DQI score and count of "clean" patients based on current filter context.
 * 
 * BUSINESS CONTEXT:
 * DQI (Data Quality Index) is a composite score (0-100) measuring overall data quality
 * for each subject. "Clean" status means the subject has no open queries or data issues.
 * 
 * KEY METRICS:
 * - Average DQI Score: Mean DQI across all subjects in current filter
 * - Clean Patient Count: Number of subjects with "Clean" status
 * - Total Patients: Total subjects in current filter
 * - Clean Percentage: Percentage of subjects that are clean
 * 
 * USE IN DASHBOARD:
 * Powers KPI cards showing overall data quality health at a glance.
 * Updates dynamically as user applies study/region/country/site filters.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDQIMetrics } from "@/database/queries/dqi-metrics";

/**
 * GET /api/dqi-metrics
 * 
 * Retrieves DQI summary metrics based on filters.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter by study/project
 *   - region: Filter by region
 *   - country: Filter by country
 *   - siteId: Filter by site
 *   - subjectId: Filter by specific subject
 * 
 * @returns JSON response with DQI metrics:
 *   - averageDQI: Average DQI score (rounded to 2 decimals)
 *   - cleanPatientCount: Count of clean subjects
 *   - totalPatients: Total subject count
 *   - cleanPercentage: Percentage of clean subjects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    const metrics = getDQIMetrics(study, region, country, siteId, subjectId);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in dqi-metrics API:", error);
    return NextResponse.json(
      { error: "Failed to fetch DQI metrics" },
      { status: 500 },
    );
  }
}
