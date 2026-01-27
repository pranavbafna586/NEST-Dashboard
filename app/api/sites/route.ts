/**
 * Sites List API Endpoint
 * 
 * PURPOSE:
 * Returns list of hospital/clinic sites participating in trials, with hierarchical filtering
 * by study, region, and country. Enables site-level performance analysis and drill-down.
 * 
 * BUSINESS CONTEXT - What is a Site?
 * A site is a hospital, clinic, or research center enrolling subjects and collecting data:
 * - Managed by a Principal Investigator (PI) - the lead doctor
 * - Staffed by site coordinators, nurses, and data entry staff
 * - Responsible for patient recruitment, data entry, query resolution
 * - Monitored by Clinical Research Associates (CRAs) from sponsor company
 * 
 * WHY SITE-LEVEL FILTERING MATTERS:
 * - Identify top-performing sites (for recognition and enrollment allocation)
 * - Flag underperforming sites (for training and support)
 * - Compare sites within same country/region
 * - Allocate CRA resources to problematic sites
 * - Make site activation/closure decisions
 * 
 * SITE PERFORMANCE INDICATORS:
 * - Enrollment rate (subjects enrolled per month)
 * - Data quality (query rate, clean CRF percentage)
 * - Protocol compliance (deviation rate)
 * - Retention rate (dropout percentage)
 * - Data entry timeliness
 * 
 * HIERARCHICAL FILTERING:
 * - study → region → country → site
 * - Creates 4-level cascading dropdown for precise drill-down
 * - Example: "Study 1" > "EMEA" > "USA" > "Site 101"
 * 
 * SITE NAMING:
 * - Typically numbered: Site 1, Site 2, Site 101, Site 201
 * - Sometimes geographic: "Boston General Hospital", "Paris Clinic Central"
 * - May include site ID codes for confidentiality
 * 
 * DATA SOURCE:
 * - Delegates to getUniqueSites from sidebar-filters query module
 * - Queries DISTINCT site_id from subject_level_metrics table
 * - Filtered by project_name, region, and/or country if provided
 * - Excel Source: CPID_EDC_Metrics.xlsx (site_id column)
 * 
 * USE IN DASHBOARD:
 * Powers the "Site" filter dropdown, enabling site-specific performance views.
 */

import { NextResponse } from "next/server";
import { getUniqueSites } from "@/database/queries/sidebar-filters";

/**
 * GET /api/sites
 * 
 * Retrieves list of unique site IDs, optionally filtered by study, region, and/or country.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter sites to those in specified study
 *   - region: Filter sites to those in specified region
 *   - country: Filter sites to those in specified country
 * 
 * @returns JSON response: { sites: string[] }
 *   Site IDs like "Site 1", "Site 2", "Site 101", etc.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    // Fetch distinct sites with hierarchical filtering
    const sites = getUniqueSites(study, region, country);
    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error in /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 },
    );
  }
}
