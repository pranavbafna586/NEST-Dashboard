/**
 * Studies List API Endpoint
 * 
 * PURPOSE:
 * Returns list of all unique clinical trials (studies) in the database for filter dropdown population.
 * 
 * BUSINESS CONTEXT:
 * Clinical Trial Management systems often manage multiple concurrent studies. This endpoint
 * provides the complete list of studies for:
 * - Dashboard filter dropdowns (allowing users to select specific trials to view)
 * - Study selection in navigation menus
 * - Multi-study comparison tools
 * 
 * TYPICAL STUDIES IN SYSTEM:
 * - Study 1, Study 2Study 3, etc. (as per current implementation)
 * - Real-world examples might be: "Phase 3 Oncology Trial", "Diabetes Study EMEA"
 * 
 * DATA SOURCE:
 * - Delegates to getUniqueStudies from sidebar-filters query module
 * - Queries DISTINCT project_name from subject_level_metrics table
 * - Excel Source: CPID_EDC_Metrics.xlsx (project_name column across sheets)
 * 
 * USE IN DASHBOARD:
 * Powers the "Study" filter dropdown at top of dashboard, enabling users to filter
 * all visualizations to a single clinical trial.
 */

import { NextResponse } from "next/server";
import { getUniqueStudies } from "@/database/queries/sidebar-filters";

/**
 * GET /api/studies
 * 
 * Retrieves list of all unique study names in the database.
 * 
 * @returns JSON response: { studies: string[] }
 */
export async function GET() {
  try {
    // Fetch distinct study names from database
    const studies = getUniqueStudies();
    return NextResponse.json({ studies });
  } catch (error) {
    console.error("Error in /api/studies:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies" },
      { status: 500 },
    );
  }
}
