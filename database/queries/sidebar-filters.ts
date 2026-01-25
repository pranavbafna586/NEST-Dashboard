import { getDatabase } from "../db";

/**
 * Get unique studies from subject_level_metrics table
 * @returns Array of unique project names
 */
export function getUniqueStudies(): Array<{ project_name: string }> {
  try {
    const database = getDatabase();
    const query = `SELECT DISTINCT project_name FROM subject_level_metrics WHERE project_name IS NOT NULL ORDER BY project_name`;
    const rows = database.prepare(query).all() as Array<{
      project_name: string;
    }>;
    return rows;
  } catch (error) {
    console.error("Error fetching unique studies:", error);
    return [];
  }
}

/**
 * Get unique regions from subject_level_metrics table
 * @param study - Optional study/project filter
 * @returns Array of unique region names
 */
export function getUniqueRegions(study?: string): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT region FROM subject_level_metrics WHERE region IS NOT NULL`;
    const params: string[] = [];

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }

    query += ` ORDER BY region`;

    const stmt = database.prepare(query);
    const rows = (
      study && study !== "ALL" ? stmt.all(...params) : stmt.all()
    ) as Array<{ region: string }>;
    return rows.map((row) => row.region);
  } catch (error) {
    console.error("Error fetching unique regions:", error);
    return [];
  }
}

/**
 * Get unique countries, optionally filtered by study and region
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @returns Array of unique country names
 */
export function getUniqueCountries(study?: string, region?: string): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT country FROM subject_level_metrics WHERE country IS NOT NULL`;
    const params: string[] = [];

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }

    query += ` ORDER BY country`;

    const stmt = database.prepare(query);
    const rows = (
      params.length > 0 ? stmt.all(...params) : stmt.all()
    ) as Array<{ country: string }>;
    return rows.map((row) => row.country);
  } catch (error) {
    console.error("Error fetching unique countries:", error);
    return [];
  }
}

/**
 * Get unique sites, optionally filtered by study, region and/or country
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @returns Array of unique site objects with site_id
 */
export function getUniqueSites(
  study?: string,
  region?: string,
  country?: string,
): Array<{ site_id: string }> {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT site_id FROM subject_level_metrics WHERE site_id IS NOT NULL`;
    const params: string[] = [];

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }

    if (country && country !== "ALL") {
      query += ` AND country = ?`;
      params.push(country);
    }

    query += ` ORDER BY site_id`;

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Array<{ site_id: string }>;
    return rows;
  } catch (error) {
    console.error("Error fetching unique sites:", error);
    return [];
  }
}

/**
 * Get unique subjects, optionally filtered by study, site, region, and/or country
 * @param study - Optional study/project filter
 * @param siteId - Optional site filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @returns Array of unique subject IDs
 */
export function getUniqueSubjects(
  study?: string,
  siteId?: string,
  region?: string,
  country?: string,
): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT subject_id FROM subject_level_metrics WHERE subject_id IS NOT NULL`;
    const params: string[] = [];

    if (study && study !== "ALL") {
      query += ` AND project_name = ?`;
      params.push(study);
    }

    if (siteId && siteId !== "ALL") {
      query += ` AND site_id = ?`;
      params.push(siteId);
    }

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
      params.push(region);
    }

    if (country && country !== "ALL") {
      query += ` AND country = ?`;
      params.push(country);
    }

    query += ` ORDER BY subject_id`;

    const stmt = database.prepare(query);
    const rows = stmt.all(...params) as Array<{ subject_id: string }>;
    return rows.map((row) => row.subject_id);
  } catch (error) {
    console.error("Error fetching unique subjects:", error);
    return [];
  }
}
