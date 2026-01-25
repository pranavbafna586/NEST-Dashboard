import { getDatabase } from "../db";

export interface CountryPerformanceResult {
  country: string;
  openQueries: number;
  avgDaysOutstanding: number;
}

/**
 * Get Country Performance Metrics
 * Combines query data from subject_level_metrics and days outstanding from missing_visits
 *
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of country performance metrics
 */
export function getCountryPerformance(
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): CountryPerformanceResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";

    if (region && region !== "ALL") {
      whereClause += " AND slm.region = ?";
      params.push(region);
    }
    if (country && country !== "ALL") {
      whereClause += " AND slm.country = ?";
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      whereClause += " AND slm.site_id = ?";
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      whereClause += " AND slm.subject_id = ?";
      params.push(subjectId);
    }

    // Main query combining data from subject_level_metrics and missing_visits
    const query = `
      SELECT 
        slm.country,
        COALESCE(SUM(slm.total_queries), 0) as openQueries,
        COALESCE(
          (SELECT AVG(mv.days_outstanding)
           FROM missing_visits mv
           WHERE mv.country = slm.country
           ${region && region !== "ALL" ? "" : ""}
           ${country && country !== "ALL" ? "AND mv.country = ?" : ""}
           ${siteId && siteId !== "ALL" ? "AND mv.site_id = ?" : ""}
           ${subjectId && subjectId !== "ALL" ? "AND mv.subject_id = ?" : ""}
          ), 0
        ) as avgDaysOutstanding
      FROM subject_level_metrics slm
      ${whereClause}
      GROUP BY slm.country
      ORDER BY openQueries DESC
    `;

    // Build params for the subquery
    const allParams = [...params];
    if (country && country !== "ALL") {
      allParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      allParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      allParams.push(subjectId);
    }

    const stmt = database.prepare(query);
    const results = stmt.all(...allParams) as CountryPerformanceResult[];

    // Ensure all values are properly formatted
    return results.map((row) => ({
      country: row.country || "Unknown",
      openQueries: Math.round(row.openQueries || 0),
      avgDaysOutstanding: Math.round(row.avgDaysOutstanding || 0),
    }));
  } catch (error) {
    console.error("Error fetching country performance:", error);
    return [];
  }
}

/**
 * Get Country Performance Metrics - Simplified version
 * Uses only subject_level_metrics table for better performance
 *
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of country performance metrics
 */
export function getCountryPerformanceSimplified(
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): CountryPerformanceResult[] {
  try {
    const database = getDatabase();

    // First get queries by country
    const queriesParams: string[] = [];
    let queriesWhereClause = "WHERE 1=1";

    if (region && region !== "ALL") {
      queriesWhereClause += " AND region = ?";
      queriesParams.push(region);
    }
    if (country && country !== "ALL") {
      queriesWhereClause += " AND country = ?";
      queriesParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      queriesWhereClause += " AND site_id = ?";
      queriesParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      queriesWhereClause += " AND subject_id = ?";
      queriesParams.push(subjectId);
    }

    const queriesQuery = `
      SELECT 
        country,
        COALESCE(SUM(total_queries), 0) as openQueries
      FROM subject_level_metrics
      ${queriesWhereClause}
      GROUP BY country
    `;

    const queriesStmt = database.prepare(queriesQuery);
    const queriesResults = queriesStmt.all(...queriesParams) as Array<{
      country: string;
      openQueries: number;
    }>;

    // Get average days outstanding by country from missing_visits
    const daysParams: string[] = [];
    let daysWhereClause = "WHERE 1=1";

    if (country && country !== "ALL") {
      daysWhereClause += " AND country = ?";
      daysParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      daysWhereClause += " AND site_id = ?";
      daysParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      daysWhereClause += " AND subject_id = ?";
      daysParams.push(subjectId);
    }

    const daysQuery = `
      SELECT 
        country,
        COALESCE(AVG(days_outstanding), 0) as avgDaysOutstanding
      FROM missing_visits
      ${daysWhereClause}
      GROUP BY country
    `;

    const daysStmt = database.prepare(daysQuery);
    const daysResults = daysStmt.all(...daysParams) as Array<{
      country: string;
      avgDaysOutstanding: number;
    }>;

    // Create a map for days outstanding
    const daysMap = new Map<string, number>();
    daysResults.forEach((row) => {
      daysMap.set(row.country, Math.round(row.avgDaysOutstanding || 0));
    });

    // Combine results
    const results: CountryPerformanceResult[] = queriesResults.map((row) => ({
      country: row.country || "Unknown",
      openQueries: Math.round(row.openQueries || 0),
      avgDaysOutstanding: daysMap.get(row.country) || 0,
    }));

    // Sort by open queries descending
    return results.sort((a, b) => b.openQueries - a.openQueries);
  } catch (error) {
    console.error("Error fetching country performance (simplified):", error);
    return [];
  }
}
