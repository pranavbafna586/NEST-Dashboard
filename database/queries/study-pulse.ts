import { getDatabase } from "../db";

export interface StudyPulseResult {
  pagesEntered: number;
  totalQueries: number;
  activeSubjects: number;
  missingPages: number;
  cleanCRFPercentage: number;
}

/**
 * Get Study Pulse Metrics
 * Aggregates key metrics from subject_level_metrics for the Study Pulse chart
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Study pulse metrics
 */
export function getStudyPulseMetrics(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): StudyPulseResult {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
    }
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

    // Query to get all study pulse metrics
    const query = `
      SELECT 
        COALESCE(SUM(pages_entered), 0) as pagesEntered,
        COALESCE(SUM(total_queries), 0) as totalQueries,
        COUNT(*) as activeSubjects,
        COALESCE(SUM(missing_page), 0) as missingPages,
        CASE 
          WHEN SUM(pages_entered) > 0 
          THEN ROUND(AVG(percentage_clean_crf), 2)
          ELSE 0 
        END as cleanCRFPercentage
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as StudyPulseResult;

    // Ensure all values are numbers (handle NULL cases)
    return {
      pagesEntered: result.pagesEntered || 0,
      totalQueries: result.totalQueries || 0,
      activeSubjects: result.activeSubjects || 0,
      missingPages: result.missingPages || 0,
      cleanCRFPercentage: result.cleanCRFPercentage || 0,
    };
  } catch (error) {
    console.error("Error fetching study pulse metrics:", error);
    return {
      pagesEntered: 0,
      totalQueries: 0,
      activeSubjects: 0,
      missingPages: 0,
      cleanCRFPercentage: 0,
    };
  }
}

/**
 * Get Study Pulse Status
 * Determines the overall study health status based on clean CRF percentage
 *
 * @param cleanCRFPercentage - The percentage of clean CRFs
 * @returns Status object with label and color indicator
 */
export function getStudyPulseStatus(cleanCRFPercentage: number): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (cleanCRFPercentage >= 80) {
    return { label: "On Track", color: "green" };
  } else if (cleanCRFPercentage >= 50) {
    return { label: "At Risk", color: "yellow" };
  } else {
    return { label: "Critical", color: "red" };
  }
}
