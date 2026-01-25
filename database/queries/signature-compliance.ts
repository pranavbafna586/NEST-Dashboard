import { getDatabase } from "../db";

export interface SignatureComplianceResult {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Get Signature Compliance Data
 * Groups signatures by compliance status with optional filters
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of signature compliance data
 */
export function getSignatureComplianceData(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): SignatureComplianceResult[] {
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

    // Query to get signature compliance breakdown
    const query = `
      SELECT 
        SUM(CASE 
          WHEN page_require_signature LIKE '%Never%' THEN 1 
          ELSE 0 
        END) as never_signed,
        SUM(CASE 
          WHEN page_require_signature LIKE '%Broken%' THEN 1 
          ELSE 0 
        END) as broken_signatures,
        SUM(CASE 
          WHEN no_of_days >= 90 AND page_require_signature NOT LIKE '%Never%' AND page_require_signature NOT LIKE '%Broken%' THEN 1 
          ELSE 0 
        END) as beyond_90_days,
        SUM(CASE 
          WHEN no_of_days >= 45 AND no_of_days < 90 AND page_require_signature NOT LIKE '%Never%' AND page_require_signature NOT LIKE '%Broken%' THEN 1 
          ELSE 0 
        END) as days_45_to_90,
        SUM(CASE 
          WHEN no_of_days < 45 AND page_require_signature NOT LIKE '%Never%' AND page_require_signature NOT LIKE '%Broken%' THEN 1 
          ELSE 0 
        END) as within_45_days,
        COUNT(*) as total
      FROM pi_signature_report
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as {
      never_signed: number;
      broken_signatures: number;
      beyond_90_days: number;
      days_45_to_90: number;
      within_45_days: number;
      total: number;
    };

    const total = result.total || 1; // Avoid division by zero

    // Define colors for each category (red to green gradient based on severity)
    const categories: SignatureComplianceResult[] = [
      {
        category: "Never Signed",
        count: result.never_signed || 0,
        percentage: ((result.never_signed || 0) / total) * 100,
        color: "#E57373", // Soft red - Critical
      },
      {
        category: "Broken Signatures",
        count: result.broken_signatures || 0,
        percentage: ((result.broken_signatures || 0) / total) * 100,
        color: "#FFB74D", // Soft orange - Severe
      },
      {
        category: "Overdue 90+ Days",
        count: result.beyond_90_days || 0,
        percentage: ((result.beyond_90_days || 0) / total) * 100,
        color: "#FFD54F", // Soft amber - High risk
      },
      {
        category: "Overdue 45-90 Days",
        count: result.days_45_to_90 || 0,
        percentage: ((result.days_45_to_90 || 0) / total) * 100,
        color: "#FCD34D", // Yellow - Medium risk
      },
      {
        category: "Compliant (<45 Days)",
        count: result.within_45_days || 0,
        percentage: ((result.within_45_days || 0) / total) * 100,
        color: "#10B981", // Green - Good
      },
    ];

    // Filter out categories with zero count for cleaner visualization
    return categories.filter((cat) => cat.count > 0);
  } catch (error) {
    console.error("Error fetching signature compliance data:", error);
    return [];
  }
}

/**
 * Get Signature Compliance Summary Statistics
 * Returns overall compliance metrics
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Summary statistics object
 */
export function getSignatureComplianceSummary(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): {
  totalForms: number;
  compliantForms: number;
  atRiskForms: number;
  criticalForms: number;
  complianceRate: number;
} {
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
        COUNT(*) as total,
        SUM(CASE WHEN no_of_days < 45 AND page_require_signature NOT LIKE '%Never%' AND page_require_signature NOT LIKE '%Broken%' THEN 1 ELSE 0 END) as compliant,
        SUM(CASE WHEN no_of_days >= 45 AND no_of_days < 90 THEN 1 ELSE 0 END) as at_risk,
        SUM(CASE WHEN no_of_days >= 90 OR page_require_signature LIKE '%Never%' OR page_require_signature LIKE '%Broken%' THEN 1 ELSE 0 END) as critical
      FROM pi_signature_report
      ${whereClause}
    `;

    const stmt = database.prepare(query);
    const result = stmt.get(...params) as {
      total: number;
      compliant: number;
      at_risk: number;
      critical: number;
    };

    const total = result.total || 1;
    const compliant = result.compliant || 0;

    return {
      totalForms: result.total || 0,
      compliantForms: compliant,
      atRiskForms: result.at_risk || 0,
      criticalForms: result.critical || 0,
      complianceRate: (compliant / total) * 100,
    };
  } catch (error) {
    console.error("Error fetching signature compliance summary:", error);
    return {
      totalForms: 0,
      compliantForms: 0,
      atRiskForms: 0,
      criticalForms: 0,
      complianceRate: 0,
    };
  }
}
