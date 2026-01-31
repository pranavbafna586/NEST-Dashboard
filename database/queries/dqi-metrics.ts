import { getDatabase } from "../db";

export interface DQIMetrics {
  averageDQI: number;
  cleanPatientCount: number;
  totalPatients: number;
  cleanPercentage: number;
}

/**
 * Get DQI Summary Metrics
 * Calculates average DQI score and clean patient count based on filters
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns DQI metrics object
 */
export function getDQIMetrics(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): DQIMetrics {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters with table aliases
    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND slm.project_name = ?";
      params.push(study);
    }
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

    const query = `
      SELECT 
        ROUND(AVG(dqi.dqi_score), 2) as averageDQI,
        COUNT(CASE WHEN dqi.clean_status = 'Clean' THEN 1 END) as cleanPatientCount,
        COUNT(*) as totalPatients
      FROM subject_level_metrics slm
      LEFT JOIN subject_dqi_clean_status dqi 
        ON slm.project_name = dqi.project_name 
        AND slm.site_id = dqi.site_id 
        AND slm.subject_id = dqi.subject_id
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as {
      averageDQI: number | null;
      cleanPatientCount: number;
      totalPatients: number;
    };

    const averageDQI = result.averageDQI || 0;
    const cleanPatientCount = result.cleanPatientCount || 0;
    const totalPatients = result.totalPatients || 0;
    const cleanPercentage =
      totalPatients > 0
        ? Math.round((cleanPatientCount / totalPatients) * 100)
        : 0;

    return {
      averageDQI,
      cleanPatientCount,
      totalPatients,
      cleanPercentage,
    };
  } catch (error) {
    console.error("Error fetching DQI metrics:", error);
    return {
      averageDQI: 0,
      cleanPatientCount: 0,
      totalPatients: 0,
      cleanPercentage: 0,
    };
  }
}
