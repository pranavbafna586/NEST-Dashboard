import { getDatabase } from "../db";

export interface SitePerformanceResult {
  siteId: string;
  siteName: string;
  country: string;
  region: string;
  openQueries: number;
  avgDaysOutstanding: number;
  signatureBacklog: number;
  dataQualityScore: number;
  subjectCount: number;
}

/**
 * Get Site Performance Data - Signature Backlog Focus
 * Aggregates signature compliance and query metrics by site
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @returns Array of site performance data
 */
export function getSitePerformanceData(
  study?: string,
  region?: string,
  country?: string,
): SitePerformanceResult[] {
  try {
    const database = getDatabase();
    const params: string[] = [];

    // Build WHERE clause for filters
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

    // Main query to aggregate site-level metrics
    // Signature backlog: Forms overdue > 90 days for signature
    // Open queries: Total queries from query_report
    // Avg Days Outstanding: Average signature delay days
    // Data Quality: Based on clean CRF percentage and signature compliance
    const query = `
      SELECT 
        slm.site_id as siteId,
        slm.site_id as siteName,
        slm.country,
        slm.region,
        
        -- Open Queries: Sum of total queries per site
        SUM(slm.total_queries) as openQueries,
        
        -- Signature Backlog: Count of forms overdue > 90 days
        SUM(slm.crfs_overdue_beyond_90_days) as signatureBacklog,
        
        -- Average Days Outstanding: Weighted average of signature delays
        ROUND(
          CASE 
            WHEN SUM(
              slm.crfs_overdue_within_45_days + 
              slm.crfs_overdue_45_to_90_days + 
              slm.crfs_overdue_beyond_90_days
            ) > 0 THEN
              (
                SUM(slm.crfs_overdue_within_45_days * 22.5) +  -- Avg 22.5 days (midpoint of 0-45)
                SUM(slm.crfs_overdue_45_to_90_days * 67.5) +   -- Avg 67.5 days (midpoint of 45-90)
                SUM(slm.crfs_overdue_beyond_90_days * 120)     -- Avg 120 days (conservative estimate)
              ) / SUM(
                slm.crfs_overdue_within_45_days + 
                slm.crfs_overdue_45_to_90_days + 
                slm.crfs_overdue_beyond_90_days
              )
            ELSE 0
          END
        ) as avgDaysOutstanding,
        
        -- Data Quality Score: Average DQI from subject_dqi_clean_status table
        COALESCE(ROUND(AVG(dqi.dqi_score)), 0) as dataQualityScore,
        
        -- Subject Count per site
        COUNT(DISTINCT slm.subject_id) as subjectCount
        
      FROM subject_level_metrics slm
      LEFT JOIN subject_dqi_clean_status dqi 
        ON slm.project_name = dqi.project_name 
        AND slm.site_id = dqi.site_id 
        AND slm.subject_id = dqi.subject_id
      ${whereClause}
      GROUP BY slm.site_id, slm.country, slm.region
      HAVING signatureBacklog > 0  -- Only show sites with signature backlog
      ORDER BY signatureBacklog DESC, openQueries DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as SitePerformanceResult[];

    return results;
  } catch (error) {
    console.error("Error fetching site performance data:", error);
    return [];
  }
}

/**
 * Get Detailed Site Signature Breakdown
 * Provides detailed signature compliance metrics for a specific site
 *
 * @param siteId - Site ID to get details for
 * @param study - Optional study/project filter
 * @returns Detailed signature breakdown
 */
export function getSiteSignatureDetails(
  siteId: string,
  study?: string,
): {
  siteId: string;
  totalForms: number;
  neverSigned: number;
  brokenSignatures: number;
  overdue45Days: number;
  overdue45to90Days: number;
  overdueBeyond90Days: number;
  compliant: number;
} | null {
  try {
    const database = getDatabase();
    const params: string[] = [siteId];

    let whereClause = "WHERE site_id = ?";

    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
    }

    const query = `
      SELECT 
        site_id as siteId,
        COUNT(*) as totalForms,
        SUM(CASE WHEN page_require_signature LIKE '%Never%' THEN 1 ELSE 0 END) as neverSigned,
        SUM(CASE WHEN page_require_signature LIKE '%Broken%' THEN 1 ELSE 0 END) as brokenSignatures,
        SUM(CASE 
          WHEN no_of_days < 45 
            AND page_require_signature NOT LIKE '%Never%' 
            AND page_require_signature NOT LIKE '%Broken%' 
          THEN 1 ELSE 0 
        END) as overdue45Days,
        SUM(CASE 
          WHEN no_of_days >= 45 AND no_of_days < 90 
            AND page_require_signature NOT LIKE '%Never%' 
            AND page_require_signature NOT LIKE '%Broken%' 
          THEN 1 ELSE 0 
        END) as overdue45to90Days,
        SUM(CASE 
          WHEN no_of_days >= 90 
            AND page_require_signature NOT LIKE '%Never%' 
            AND page_require_signature NOT LIKE '%Broken%' 
          THEN 1 ELSE 0 
        END) as overdueBeyond90Days,
        SUM(CASE 
          WHEN no_of_days < 45 
            AND page_require_signature NOT LIKE '%Never%' 
            AND page_require_signature NOT LIKE '%Broken%' 
          THEN 1 ELSE 0 
        END) as compliant
      FROM pi_signature_report
      ${whereClause}
      GROUP BY site_id
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as
      | {
          siteId: string;
          totalForms: number;
          neverSigned: number;
          brokenSignatures: number;
          overdue45Days: number;
          overdue45to90Days: number;
          overdueBeyond90Days: number;
          compliant: number;
        }
      | undefined;

    return result || null;
  } catch (error) {
    console.error("Error fetching site signature details:", error);
    return null;
  }
}
