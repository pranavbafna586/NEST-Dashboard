/**
 * Countries List API Endpoint
 * 
 * PURPOSE:
 * Returns list of unique countries participating in trials, with hierarchical filtering
 * by study and/or region. Enables country-level drill-down analysis.
 * 
 * BUSINESS CONTEXT:
 * Clinical trials span multiple countries, each with unique characteristics:
 * - Different regulatory requirements and approval processes
 * - Language and cultural factors affecting data quality
 * - Healthcare infrastructure variations
 * - Economic conditions affecting patient retention
 * 
 * Country-level filtering enables:
 * - Identifying country-specific performance issues
 * - Comparing enrollment rates across nations
 * - Allocating resources to countries needing support
 * - Understanding geographic data quality patterns
 * 
 * HIERARCHICAL FILTERING:
 * - If study provided: Returns countries in that study
 * - If study + region provided: Returns countries in that study AND region
 * - This creates dependent cascading dropdowns for precise filtering
 * 
 * EXAMPLE FILTERING FLOW:
 * 1. User selects "Study 1" → Countries list updates to show Study 1 countries
 * 2. User selects "EMEA" region → Countries list further filters to EMEA countries in Study 1
 * 3. User selects "FRA" → All dashboard data filters to Study 1, EMEA, France
 * 
 * DATA SOURCE:
 * - Delegates to getUniqueCountries from sidebar-filters query module
 * - Queries DISTINCT country from subject_level_metrics table
 * - Filtered by project_name and/or region if provided
 * - Excel Source: CPID_EDC_Metrics.xlsx (country column)
 * 
 * USE IN DASHBOARD:
 * Powers the "Country" filter dropdown with dependent filtering logic.
 */

import { NextResponse } from "next/server";
import { getUniqueCountries } from "@/database/queries/sidebar-filters";

/**
 * GET /api/countries
 * 
 * Retrieves list of unique country codes, optionally filtered by study and/or region.
 * 
 * @param request - HTTP request with optional query parameters:
 *   - study: Filter countries to those in specified study
 *   - region: Filter countries to those in specified region
 * 
 * @returns JSON response: { countries: string[] }
 *   Country codes like "USA", "FRA", "GBR", "JPN", etc.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;

    // Fetch distinct countries with hierarchical filtering
    const countries = getUniqueCountries(study, region);
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("Error in /api/countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 },
    );
  }
}
