/**
 * Regions List API Endpoint
 * 
 * PURPOSE:
 * Returns list of unique geographic regions for hierarchical filtering. Supports
 * dynamic filtering to show only regions present in selected study.
 * 
 * BUSINESS CONTEXT:
 * Clinical trials are organized by geographic regions for:
 * - Regulatory jurisdiction (FDA for Americas, EMA for EMEA, PMDA for APAC)
 * - Time zone coordination (Americas, EMEA, APAC)
 * - Regional management structure
 * - Cultural/language groupings
 * 
 * TYPICAL REGIONS:
 * - EMEA (Europe, Middle East, Africa)
 * - Americas (North America, Latin America)
 * - APAC (Asia-Pacific)
 * - Sometimes subdivided: North America, Latin America, Western Europe, Eastern Europe, etc.
 * 
 * HIERARCHICAL FILTERING:
 * If study parameter provided, returns only regions present in that study.
 * This creates dependent dropdowns: Study selection updates available regions.
 * 
 * DATA SOURCE:
 * - Delegates to getUniqueRegions from sidebar-filters query module
 * - Queries DISTINCT region from subject_level_metrics table
 * - Optionally filtered by project_name if study parameter provided
 * - Excel Source: CPID_EDC_Metrics.xlsx (region column)
 * 
 * USE IN DASHBOARD:
 * Powers the "Region" filter dropdown, dynamically updating based on study selection.
 */

import { NextResponse } from "next/server";
import { getUniqueRegions } from "@/database/queries/sidebar-filters";

/**
 * GET /api/regions
 * 
 * Retrieves list of unique region names, optionally filtered by study.
 * 
 * @param request - HTTP request with optional query parameter:
 *   - study: Filter regions to those present in specified study
 * 
 * @returns JSON response: { regions: string[] }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;

    // Fetch distinct regions, optionally filtered by study
    const regions = getUniqueRegions(study);
    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Error in /api/regions:", error);
    return NextResponse.json(
      { error: "Failed to fetch regions" },
      { status: 500 },
    );
  }
}
