import { getDatabase } from "../db";

export interface SAEChartResult {
  name: string;
  value: number;
  color: string;
}

/**
 * Get SAE Chart Data by Case Status
 * Groups SAE issues by case_status with optional filters
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @param reviewStatus - Optional review status filter
 * @param actionStatus - Optional action status filter
 * @returns Array of SAE chart data grouped by case status
 */
export function getSAEChartData(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
  reviewStatus?: string,
  actionStatus?: string,
): SAEChartResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
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
    if (reviewStatus && reviewStatus !== "ALL") {
      whereClause += " AND review_status = ?";
      params.push(reviewStatus);
    }
    if (actionStatus && actionStatus !== "ALL") {
      whereClause += " AND action_status = ?";
      params.push(actionStatus);
    }

    // Query to get SAE counts by case_status
    // Note: NULL and '-' values in case_status represent 'Open' status
    const query = `
      SELECT 
        CASE 
          WHEN case_status IS NULL OR case_status = '' OR case_status = '-' THEN 'Open'
          ELSE case_status
        END as case_status,
        COUNT(*) as count
      FROM sae_issues
      ${whereClause}
      GROUP BY 
        CASE 
          WHEN case_status IS NULL OR case_status = '' OR case_status = '-' THEN 'Open'
          ELSE case_status
        END
      ORDER BY 
        CASE 
          WHEN case_status IS NULL OR case_status = '' OR case_status = '-' THEN 1
          WHEN case_status = 'Locked' THEN 2
          WHEN case_status = 'Closed' THEN 3
          ELSE 4
        END
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as Array<{
      case_status: string;
      count: number;
    }>;

    // Define colors for each status
    const colorMap: { [key: string]: string } = {
      Open: "#E57373", // Red
      Closed: "#3CB371", // Green
      Locked: "#7B74D1", // Purple
      Unknown: "#9E9E9E", // Gray
    };

    // Transform results to SAEChartResult format
    const chartData: SAEChartResult[] = results.map((row) => ({
      name: row.case_status,
      value: row.count,
      color: colorMap[row.case_status] || "#9E9E9E",
    }));

    return chartData;
  } catch (error) {
    console.error("Error fetching SAE chart data:", error);
    return [];
  }
}

/**
 * Get SAE breakdown by review status
 * Useful for additional filtering or analysis
 *
 * @param study - Optional study/project filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of SAE counts by review status
 */
export function getSAEByReviewStatus(
  study?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): Array<{ review_status: string; count: number }> {
  try {
    const database = getDatabase();
    const params: string[] = [];

    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
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
        COALESCE(review_status, 'Unknown') as review_status,
        COUNT(*) as count
      FROM sae_issues
      ${whereClause}
      GROUP BY review_status
      ORDER BY count DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as Array<{
      review_status: string;
      count: number;
    }>;

    return results;
  } catch (error) {
    console.error("Error fetching SAE by review status:", error);
    return [];
  }
}

/**
 * Get SAE breakdown by action status
 * Useful for additional filtering or analysis
 *
 * @param study - Optional study/project filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of SAE counts by action status
 */
export function getSAEByActionStatus(
  study?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): Array<{ action_status: string; count: number }> {
  try {
    const database = getDatabase();
    const params: string[] = [];

    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
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
        COALESCE(action_status, 'Unknown') as action_status,
        COUNT(*) as count
      FROM sae_issues
      ${whereClause}
      GROUP BY action_status
      ORDER BY count DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as Array<{
      action_status: string;
      count: number;
    }>;

    return results;
  } catch (error) {
    console.error("Error fetching SAE by action status:", error);
    return [];
  }
}

/**
 * Get SAE breakdown by responsible function
 * Shows distribution between DM and Safety teams
 *
 * @param study - Optional study/project filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of SAE counts by responsible_lf
 */
export function getSAEByResponsibleFunction(
  study?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): Array<{ responsible_lf: string; count: number }> {
  try {
    const database = getDatabase();
    const params: string[] = [];

    let whereClause = "WHERE 1=1";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
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
        COALESCE(responsible_lf, 'Unknown') as responsible_lf,
        COUNT(*) as count
      FROM sae_issues
      ${whereClause}
      GROUP BY responsible_lf
      ORDER BY count DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as Array<{
      responsible_lf: string;
      count: number;
    }>;

    return results;
  } catch (error) {
    console.error("Error fetching SAE by responsible function:", error);
    return [];
  }
}
