/**
 * Subjects List API Endpoint
 * 
 * PURPOSE:
 * Returns list of unique subject (patient) IDs with hierarchical filtering, enabling
 * subject-level drill-down and Patient 360° views.
 * 
 * BUSINESS CONTEXT - What is a Subject?
 * Subject = Patient/participant enrolled in clinical trial
 * - Each subject assigned unique ID for data privacy (not real names)
 * - Subjects progress through trial lifecycle: Screening → Enrolled → On Trial → Follow-Up → Completed
 * - May discontinue early due to adverse events, withdrawal of consent, protocol violations, etc.
 * 
 * WHY SUBJECT-LEVEL FILTERING MATTERS:
 * - Patient 360° View: See all data for one subject across all forms
 * - Subject-specific investigations when data quality issues arise
 * - Protocol deviation tracking for individual subjects
 * - Safety signal investigation (e.g., "Show me all data for subject with SAE")
 * - Data lock verification (ensuring all subject data is complete)
 * 
 * SUBJECT ID FORMATS:
 * - Typically Site# + Sequential#: "101-001", "101-002", "201-001"
 * - Sometimes Study + Site + Subject: "S1-101-001"
 * - Privacy requirement: Never use patient names, only anonymized IDs
 * 
 * HIERARCHICAL FILTERING:
 * - study → site → subject (subjects belong to specific sites)
 * - Can also filter by region/country to see subjects in that geography
 * - Example: "Study 1" > "Site 101" shows only subjects from Site 101
 * 
 * SUBJECT LIFECYCLE STATUSES:
 * - Screening: Undergoing eligibility assessment
 * - Screen Failure: Did not meet eligibility criteria
 * - Enrolled: Passed screening, officially entered into trial
 * - On Trial: Actively receiving treatment/assessments
 * - Follow-Up: Treatment completed, monitoring long-term effects
 * - Completed: Finished all protocol requirements
 * - Discontinued: Exited trial early (for various reasons)
 * 
 * DATA SOURCE:
 * - Delegates to getUniqueSubjects from sidebar-filters query module
 * - Queries DISTINCT subject_id from subject_level_metrics table
 * - Filtered by study, site, region, and/or country
 * - Excel Source: CPID_EDC_Metrics.xlsx (subject_id column)
 * 
 * USE IN DASHBOARD:
 * Powers the "Subject" filter dropdown, enabling drill-down to individual patient data.
 */

import { NextResponse } from "next/server";
import { getUniqueSubjects } from "@/database/queries/sidebar-filters";

/**
 * GET /api/subjects
 * 
 * Retrieves list of unique subject IDs, optionally filtered by study, site, region, and/or country.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter subjects to those in specified study
 *   - siteId: Filter subjects to those at specified site
 *   - region: Filter subjects to those in specified region
 *   - country: Filter subjects to those in specified country
 * 
 * @returns JSON response: { subjects: string[] }
 *   Subject IDs like "101-001", "101-002", "201-001", etc.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;

    // Fetch distinct subject IDs with hierarchical filtering
    const subjects = getUniqueSubjects(study, siteId, region, country);
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error in /api/subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
