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
 * @returns Array of unique region names
 */
export function getUniqueRegions(): string[] {
  try {
    const database = getDatabase();
    const query = `SELECT DISTINCT region FROM subject_level_metrics WHERE region IS NOT NULL ORDER BY region`;
    const rows = database.prepare(query).all() as Array<{ region: string }>;
    return rows.map((row) => row.region);
  } catch (error) {
    console.error("Error fetching unique regions:", error);
    return [];
  }
}

/**
 * Get unique countries, optionally filtered by region
 * @param region - Optional region filter
 * @returns Array of unique country names
 */
export function getUniqueCountries(region?: string): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT country FROM subject_level_metrics WHERE country IS NOT NULL`;

    if (region && region !== "ALL") {
      query += ` AND region = ?`;
    }

    query += ` ORDER BY country`;

    const stmt = database.prepare(query);
    const rows = (
      region && region !== "ALL" ? stmt.all(region) : stmt.all()
    ) as Array<{ country: string }>;
    return rows.map((row) => row.country);
  } catch (error) {
    console.error("Error fetching unique countries:", error);
    return [];
  }
}

/**
 * Get unique sites, optionally filtered by region and/or country
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @returns Array of unique site objects with site_id
 */
export function getUniqueSites(
  region?: string,
  country?: string,
): Array<{ site_id: string }> {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT site_id FROM subject_level_metrics WHERE site_id IS NOT NULL`;
    const params: string[] = [];

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
 * Get unique subjects, optionally filtered by site, region, and/or country
 * @param siteId - Optional site filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @returns Array of unique subject IDs
 */
export function getUniqueSubjects(
  siteId?: string,
  region?: string,
  country?: string,
): string[] {
  try {
    const database = getDatabase();
    let query = `SELECT DISTINCT subject_id FROM subject_level_metrics WHERE subject_id IS NOT NULL`;
    const params: string[] = [];

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
