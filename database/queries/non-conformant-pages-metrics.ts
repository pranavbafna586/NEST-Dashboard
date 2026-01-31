import { getDatabase } from "../db";

export interface NonConformantPagesMetrics {
  totalNonConformantPages: number;
}

export interface NonConformantPagesByStudy {
  studyName: string;
  nonConformantPages: number;
}

export interface NonConformantPagesBySite {
  studyName: string;
  siteId: string;
  nonConformantPages: number;
}

/**
 * Get Non-Conformant Pages Summary Metrics
 * Returns total count of non-conformant pages
 */
export function getNonConformantPagesMetrics(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): NonConformantPagesMetrics {
  try {
    const database = getDatabase();
    const params: string[] = [];
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

    const query = `
      SELECT 
        SUM(pages_non_conformant) as totalNonConformantPages
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as {
      totalNonConformantPages: number | null;
    };

    return {
      totalNonConformantPages: result.totalNonConformantPages || 0,
    };
  } catch (error) {
    console.error("Error fetching non-conformant pages metrics:", error);
    return {
      totalNonConformantPages: 0,
    };
  }
}

/**
 * Get Non-Conformant Pages breakdown by Study
 */
export function getNonConformantPagesByStudy(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): NonConformantPagesByStudy[] {
  try {
    const database = getDatabase();
    const params: string[] = [];
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

    const query = `
      SELECT 
        project_name as studyName,
        SUM(pages_non_conformant) as nonConformantPages
      FROM subject_level_metrics
      ${whereClause}
      GROUP BY project_name
      ORDER BY nonConformantPages DESC
    `;

    const stmt = database.prepare(query);
    return stmt.all(...params) as NonConformantPagesByStudy[];
  } catch (error) {
    console.error("Error fetching non-conformant pages by study:", error);
    return [];
  }
}

/**
 * Get Non-Conformant Pages breakdown by Site (Top 10)
 */
export function getNonConformantPagesBySite(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): NonConformantPagesBySite[] {
  try {
    const database = getDatabase();
    const params: string[] = [];
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

    const query = `
      SELECT 
        project_name as studyName,
        site_id as siteId,
        SUM(pages_non_conformant) as nonConformantPages
      FROM subject_level_metrics
      ${whereClause}
      GROUP BY project_name, site_id
      ORDER BY nonConformantPages DESC
      LIMIT 10
    `;

    const stmt = database.prepare(query);
    return stmt.all(...params) as NonConformantPagesBySite[];
  } catch (error) {
    console.error("Error fetching non-conformant pages by site:", error);
    return [];
  }
}
