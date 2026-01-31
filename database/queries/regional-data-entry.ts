import { getDatabase } from "../db";

export interface RegionalDataEntryResult {
  name: string;
  completedPages: number;
  missingPages: number;
  totalExpectedPages: number;
}

/**
 * Get Regional Data Entry Progress
 * Aggregates pages_entered and missing_page from subject_level_metrics by region
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of regional data with completed and missing pages
 */
export function getRegionalDataEntryProgress(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): RegionalDataEntryResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build the base query with region backfilling logic
    // If region is null, try to get it from another row with the same project_name
    let query = `
      WITH region_lookup AS (
        SELECT DISTINCT project_name, region
        FROM subject_level_metrics
        WHERE region IS NOT NULL
      )
      SELECT 
        COALESCE(
          slm.region, 
          (SELECT region FROM region_lookup WHERE region_lookup.project_name = slm.project_name LIMIT 1),
          'Unknown'
        ) as name,
        SUM(pages_entered) / 100.0 as completedPages,
        SUM(missing_page) as missingPages,
        SUM(pages_entered + missing_page) as totalExpectedPages
      FROM subject_level_metrics slm
      WHERE 1=1
    `;

    // Add filters
    if (study && study !== "ALL") {
      query += ` AND slm.project_name = ?`;
      params.push(study);
    }
    if (region && region !== "ALL") {
      query += ` AND COALESCE(
          slm.region, 
          (SELECT region FROM region_lookup WHERE region_lookup.project_name = slm.project_name LIMIT 1)
        ) = ?`;
      params.push(region);
    }
    if (country && country !== "ALL") {
      query += ` AND slm.country = ?`;
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      query += ` AND slm.site_id = ?`;
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      query += ` AND slm.subject_id = ?`;
      params.push(subjectId);
    }

    // Group by region and order
    query += `
      GROUP BY name
      ORDER BY name
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as RegionalDataEntryResult[];

    // Ensure all numeric values are numbers (not null)
    return results.map((row) => ({
      name: row.name,
      completedPages: row.completedPages || 0,
      missingPages: row.missingPages || 0,
      totalExpectedPages: row.totalExpectedPages || 0,
    }));
  } catch (error) {
    console.error("Error fetching regional data entry progress:", error);
    return [];
  }
}

/**
 * Get Country-level Data Entry Progress
 * Used when a specific region is selected to show breakdown by country
 *
 * @param study - Optional study/project filter
 * @param region - Required region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of country data with completed and missing pages
 */
export function getCountryDataEntryProgress(
  study: string | undefined,
  region: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): RegionalDataEntryResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    let query = `
      SELECT 
        COALESCE(country, 'Unknown') as name,
        SUM(pages_entered) / 100.0 as completedPages,
        SUM(missing_page) as missingPages,
        SUM(pages_entered + missing_page) as totalExpectedPages
      FROM subject_level_metrics
      WHERE 1=1
    `;

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }
    query += ` AND region = ?`;
    params.push(region);

    // Add additional filters
    if (country && country !== "ALL") {
      query += ` AND country = ?`;
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      query += ` AND site_id = ?`;
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      query += ` AND subject_id = ?`;
      params.push(subjectId);
    }

    query += `
      GROUP BY country
      ORDER BY name
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as RegionalDataEntryResult[];

    return results.map((row) => ({
      name: row.name,
      completedPages: row.completedPages || 0,
      missingPages: row.missingPages || 0,
      totalExpectedPages: row.totalExpectedPages || 0,
    }));
  } catch (error) {
    console.error("Error fetching country data entry progress:", error);
    return [];
  }
}

/**
 * Get Site-level Data Entry Progress
 * Used when a specific country is selected to show breakdown by site
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Required country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of site data with completed and missing pages
 */
export function getSiteDataEntryProgress(
  study: string | undefined,
  region: string | undefined,
  country: string,
  siteId?: string,
  subjectId?: string,
): RegionalDataEntryResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    let query = `
      SELECT 
        COALESCE(site_id, 'Unknown') as name,
        SUM(pages_entered) / 100.0 as completedPages,
        SUM(missing_page) as missingPages,
        SUM(pages_entered + missing_page) as totalExpectedPages
      FROM subject_level_metrics
      WHERE 1=1
    `;

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }
    query += ` AND country = ?`;
    params.push(country);

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }
    if (siteId && siteId !== "ALL") {
      query += ` AND site_id = ?`;
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      query += ` AND subject_id = ?`;
      params.push(subjectId);
    }

    query += `
      GROUP BY site_id
      ORDER BY name
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as RegionalDataEntryResult[];

    return results.map((row) => ({
      name: row.name,
      completedPages: row.completedPages || 0,
      missingPages: row.missingPages || 0,
      totalExpectedPages: row.totalExpectedPages || 0,
    }));
  } catch (error) {
    console.error("Error fetching site data entry progress:", error);
    return [];
  }
}
