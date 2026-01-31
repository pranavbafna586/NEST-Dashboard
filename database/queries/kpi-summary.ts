import { getDatabase } from "../db";

export interface KPISummary {
  totalMissingVisits: number;
  openQueries: number;
  uncodedTerms: number;
  seriousAdverseEvents: number;
  totalSubjects?: number;
  conformantPagesPercentage?: number;
  protocolDeviationsConfirmed?: number;
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
        SUM(uncoded_terms) as uncodedTerms,
        COUNT(DISTINCT subject_id) as totalSubjects,
        SUM(pages_entered) as totalPagesEntered,
        SUM(pages_non_conformant) as totalNonConformantPages
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(metricsQuery);
    const metrics = stmt.get(...params) as {
      totalMissingVisits: number;
      openQueries: number;
      uncodedTerms: number;
      totalSubjects: number;
      totalPagesEntered: number;
      totalNonConformantPages: number;
    };

    // Calculate conformant pages percentage
    const conformantPagesPercentage =
      metrics.totalPagesEntered > 0
        ? Math.round(
          ((metrics.totalPagesEntered - metrics.totalNonConformantPages) /
            metrics.totalPagesEntered) *
          100
        )
        : 0;

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

    // Get Protocol Deviations count (confirmed only)
    const pdParams: string[] = [];
    let pdWhereClause = "WHERE pd_status = 'PD Confirmed'";

    if (study && study !== "ALL") {
      pdWhereClause += " AND project_name = ?";
      pdParams.push(study);
    }
    if (region && region !== "ALL") {
      pdWhereClause += " AND region = ?";
      pdParams.push(region);
    }
    if (country && country !== "ALL") {
      pdWhereClause += " AND country = ?";
      pdParams.push(country);
    }
    if (siteId && siteId !== "ALL") {
      pdWhereClause += " AND site_id = ?";
      pdParams.push(siteId);
    }
    if (subjectId && subjectId !== "ALL") {
      pdWhereClause += " AND subject_id = ?";
      pdParams.push(subjectId);
    }

    const pdQuery = `
      SELECT COUNT(*) as pdCount
      FROM protocol_deviation
      ${pdWhereClause}
    `;

    const pdStmt = database.prepare(pdQuery);
    const pdResult = pdStmt.get(...pdParams) as { pdCount: number };

    // Calculate total conformant pages
    const totalConformantPages = Math.max(0, (metrics.totalPagesEntered || 0) - (metrics.totalNonConformantPages || 0));

    return {
      summary: {
        totalMissingVisits: metrics.totalMissingVisits || 0,
        openQueries: metrics.openQueries || 0,
        uncodedTerms: metrics.uncodedTerms || 0,
        seriousAdverseEvents: saeResult.saeCount || 0,
        totalSubjects: metrics.totalSubjects || 0,
        conformantPagesPercentage: conformantPagesPercentage,
        totalConformantPages: totalConformantPages,
        protocolDeviationsConfirmed: pdResult.pdCount || 0,
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
        totalSubjects: 0,
        conformantPagesPercentage: 0,
        totalConformantPages: 0,
        protocolDeviationsConfirmed: 0,
      },
    };
  }
}
