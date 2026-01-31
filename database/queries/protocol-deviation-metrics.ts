import { getDatabase } from "../db";

export interface ProtocolDeviationMetrics {
  totalProtocolDeviations: number;
  confirmedCount: number;
  proposedCount: number;
}

export interface ProtocolDeviationByStudy {
  studyName: string;
  confirmedCount: number;
  proposedCount: number;
  totalCount: number;
}

export interface ProtocolDeviationBySite {
  studyName: string;
  siteId: string;
  confirmedCount: number;
  proposedCount: number;
  totalCount: number;
}

/**
 * Get Protocol Deviation Summary Metrics
 * Returns total count and breakdown by status
 */
export function getProtocolDeviationMetrics(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): ProtocolDeviationMetrics {
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
        COUNT(*) as totalCount,
        COUNT(CASE WHEN pd_status = 'PD Confirmed' THEN 1 END) as confirmedCount,
        COUNT(CASE WHEN pd_status = 'PD proposed' THEN 1 END) as proposedCount
      FROM protocol_deviation
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as {
      totalCount: number;
      confirmedCount: number;
      proposedCount: number;
    };

    return {
      totalProtocolDeviations: result.totalCount || 0,
      confirmedCount: result.confirmedCount || 0,
      proposedCount: result.proposedCount || 0,
    };
  } catch (error) {
    console.error("Error fetching protocol deviation metrics:", error);
    return {
      totalProtocolDeviations: 0,
      confirmedCount: 0,
      proposedCount: 0,
    };
  }
}

/**
 * Get Protocol Deviation breakdown by Study
 */
export function getProtocolDeviationByStudy(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): ProtocolDeviationByStudy[] {
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
        COUNT(CASE WHEN pd_status = 'PD Confirmed' THEN 1 END) as confirmedCount,
        COUNT(CASE WHEN pd_status = 'PD proposed' THEN 1 END) as proposedCount,
        COUNT(*) as totalCount
      FROM protocol_deviation
      ${whereClause}
      GROUP BY project_name
      ORDER BY totalCount DESC
    `;

    const stmt = database.prepare(query);
    return stmt.all(...params) as ProtocolDeviationByStudy[];
  } catch (error) {
    console.error("Error fetching protocol deviation by study:", error);
    return [];
  }
}

/**
 * Get Protocol Deviation breakdown by Site
 */
export function getProtocolDeviationBySite(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): ProtocolDeviationBySite[] {
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
        COUNT(CASE WHEN pd_status = 'PD Confirmed' THEN 1 END) as confirmedCount,
        COUNT(CASE WHEN pd_status = 'PD proposed' THEN 1 END) as proposedCount,
        COUNT(*) as totalCount
      FROM protocol_deviation
      ${whereClause}
      GROUP BY project_name, site_id
      ORDER BY totalCount DESC
      LIMIT 10
    `;

    const stmt = database.prepare(query);
    return stmt.all(...params) as ProtocolDeviationBySite[];
  } catch (error) {
    console.error("Error fetching protocol deviation by site:", error);
    return [];
  }
}

/**
 * Get Total Conformant Pages Count
 */
export function getConformantPagesCount(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): number {
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

    // Conformant pages = pages_entered - pages_non_conformant
    const query = `
      SELECT 
        SUM(pages_entered - pages_non_conformant) as conformantPages
      FROM subject_level_metrics
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as { conformantPages: number | null };
    
    return result.conformantPages || 0;
  } catch (error) {
    console.error("Error fetching conformant pages count:", error);
    return 0;
  }
}
