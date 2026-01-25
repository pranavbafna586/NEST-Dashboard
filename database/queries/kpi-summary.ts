import { getDatabase } from "../db";

export interface KPISummary {
  totalMissingVisits: number;
  openQueries: number;
  uncodedTerms: number;
  seriousAdverseEvents: number;
}

/**
 * Get comprehensive KPI Summary (all-time data without trends)
 * Aggregates key metrics from subject_level_metrics and sae_issues tables
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns KPI summary object with totals
 */
export function getKPISummaryWithTrends(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): { summary: KPISummary } {
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

    // Get all-time aggregated metrics from subject_level_metrics
    const metricsQuery = `
      SELECT 
        SUM(missing_visits) as totalMissingVisits,
        SUM(total_queries) as openQueries,
        SUM(uncoded_terms) as uncodedTerms
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(metricsQuery);
    const metrics = stmt.get(...params) as {
      totalMissingVisits: number;
      openQueries: number;
      uncodedTerms: number;
    };

    // Get SAE count from sae_issues table (all-time)
    // Note: sae_issues doesn't have region column, only country, site_id, subject_id
    const saeParams: string[] = [];
    let saeWhereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      saeWhereClause += " AND project_name = ?";
      saeParams.push(study);
    }
    if (country && country !== "ALL") {
      saeWhereClause += " AND country = ?";
      saeParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      saeWhereClause += " AND site_id = ?";
      saeParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      saeWhereClause += " AND subject_id = ?";
      saeParams.push(subjectId);
    }

    const saeQuery = `
      SELECT COUNT(*) as saeCount
      FROM sae_issues
      ${saeWhereClause}
      AND (action_status = 'Pending' OR review_status = 'Pending for Review')
    `;

    const saeStmt = database.prepare(saeQuery);
    const saeResult = saeStmt.get(...saeParams) as { saeCount: number };

    return {
      summary: {
        totalMissingVisits: metrics.totalMissingVisits || 0,
        openQueries: metrics.openQueries || 0,
        uncodedTerms: metrics.uncodedTerms || 0,
        seriousAdverseEvents: saeResult.saeCount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching KPI summary:", error);
    return {
      summary: {
        totalMissingVisits: 0,
        openQueries: 0,
        uncodedTerms: 0,
        seriousAdverseEvents: 0,
      },
    };
  }
}
