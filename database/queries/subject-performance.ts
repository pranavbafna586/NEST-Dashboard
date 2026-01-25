import { getDatabase } from "../db";

export interface SubjectPerformanceResult {
  subject_id: string;
  latest_visit: string;
  subject_status: string;
  pages_entered: number;
  missing_page: number;
  total_queries: number;
  percentage_clean_crf: number;
  missing_visits: number;
  forms_verified: number;
}

/**
 * Get Subject Performance Metrics for a specific site
 * Returns detailed metrics for all subjects at the site level
 *
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Required site filter
 * @param subjectId - Optional subject filter
 * @returns Array of subject performance metrics
 */
export function getSubjectPerformance(
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): SubjectPerformanceResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";

    if (region && region !== "ALL") {
      whereClause += " AND region = ?";
      params.push(region);
    }
    if (country && country !== "ALL") {
      whereClause += " AND country = ?";
      params.push(country);
    }
    if (siteId && siteId !== "ALL") {
      whereClause += " AND site_id = ?";
      params.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      whereClause += " AND subject_id = ?";
      params.push(subjectId);
    }

    // Query to get subject-level metrics
    const query = `
      SELECT 
        subject_id,
        COALESCE(latest_visit, 'N/A') as latest_visit,
        COALESCE(subject_status, 'Unknown') as subject_status,
        COALESCE(pages_entered, 0) as pages_entered,
        COALESCE(missing_page, 0) as missing_page,
        COALESCE(total_queries, 0) as total_queries,
        COALESCE(percentage_clean_crf, 0) as percentage_clean_crf,
        COALESCE(missing_visits, 0) as missing_visits,
        COALESCE(forms_verified, 0) as forms_verified
      FROM subject_level_metrics
      ${whereClause}
      ORDER BY subject_id
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as SubjectPerformanceResult[];

    // Ensure all values are properly formatted
    return results.map((row) => ({
      subject_id: row.subject_id || "Unknown",
      latest_visit: row.latest_visit || "N/A",
      subject_status: row.subject_status || "Unknown",
      pages_entered: Math.round(row.pages_entered || 0),
      missing_page: Math.round(row.missing_page || 0),
      total_queries: Math.round(row.total_queries || 0),
      percentage_clean_crf:
        Math.round((row.percentage_clean_crf || 0) * 100) / 100,
      missing_visits: Math.round(row.missing_visits || 0),
      forms_verified: Math.round(row.forms_verified || 0),
    }));
  } catch (error) {
    console.error("Error fetching subject performance:", error);
    return [];
  }
}
