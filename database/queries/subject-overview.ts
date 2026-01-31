import { getDatabase } from "../db";

export interface SubjectOverviewResult {
  subjectId: string;
  siteId: string;
  siteName: string;
  country: string;
  region: string;
  studyId: string;
  projectName: string;
  status: string;
  latestVisit: string;
  missingVisits: number;
  missingPages: number;
  codedTerms: number;
  uncodedTerms: number;
  openLabIssues: number;
  openEDRRIssues: number;
  inactivatedForms: number;
  saeDMReview: number;
  saeSafetyReview: number;
  expectedVisits: number;
  pagesEntered: number;
  pagesNonConformant: number;
  queriesDM: number;
  queriesClinical: number;
  queriesMedical: number;
  queriesSite: number;
  queriesFieldMonitor: number;
  queriesCoding: number;
  queriesSafety: number;
  totalQueries: number;
  crfsRequireVerification: number;
  formsVerified: number;
  crfsFrozen: number;
  crfsNotFrozen: number;
  crfsLocked: number;
  crfsUnlocked: number;
  pdsConfirmed: number;
  crfsSigned: number;
  crfsOverdue45Days: number;
  crfsOverdue45to90Days: number;
  crfsOverdue90Days: number;
  brokenSignatures: number;
  crfsNeverSigned: number;
  isHighRisk: boolean;
  dataQualityScore: number;
  dqiScore: number | null;
  dqiCategory: string | null;
  isClean: boolean | null;
}

/**
 * Get Subject Overview Data
 * Fetches subject-level metrics for the subjects table
 *
 * @param study - Optional study/project filter
 * @param region - Optional region filter
 * @param country - Optional country filter
 * @param siteId - Optional site filter
 * @param subjectId - Optional subject filter
 * @returns Array of subject overview data
 */
export function getSubjectOverviewData(
  study?: string,
  region?: string,
  country?: string,
  siteId?: string,
  subjectId?: string,
): SubjectOverviewResult[] {
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
        slm.subject_id as subjectId,
        slm.site_id as siteId,
        slm.site_id as siteName,
        slm.country,
        slm.region,
        slm.project_name as studyId,
        slm.project_name as projectName,
        slm.subject_status as status,
        slm.latest_visit as latestVisit,
        slm.missing_visits as missingVisits,
        slm.missing_page as missingPages,
        slm.coded_terms as codedTerms,
        slm.uncoded_terms as uncodedTerms,
        slm.open_issues_in_lnr as openLabIssues,
        slm.open_issues_edrr as openEDRRIssues,
        slm.inactivated_forms_folders as inactivatedForms,
        slm.esae_dashboard_dm as saeDMReview,
        slm.esae_dashboard_safety as saeSafetyReview,
        slm.expected_visits as expectedVisits,
        slm.pages_entered as pagesEntered,
        slm.pages_non_conformant as pagesNonConformant,
        slm.dm_queries as queriesDM,
        slm.clinical_queries as queriesClinical,
        slm.medical_queries as queriesMedical,
        slm.site_queries as queriesSite,
        slm.field_monitor_queries as queriesFieldMonitor,
        slm.coding_queries as queriesCoding,
        slm.safety_queries as queriesSafety,
        slm.total_queries as totalQueries,
        slm.crfs_require_verification as crfsRequireVerification,
        slm.forms_verified as formsVerified,
        slm.crfs_frozen as crfsFrozen,
        slm.crfs_not_frozen as crfsNotFrozen,
        slm.crfs_locked as crfsLocked,
        slm.crfs_unlocked as crfsUnlocked,
        slm.pds_confirmed as pdsConfirmed,
        slm.crfs_signed as crfsSigned,
        slm.crfs_overdue_within_45_days as crfsOverdue45Days,
        slm.crfs_overdue_45_to_90_days as crfsOverdue45to90Days,
        slm.crfs_overdue_beyond_90_days as crfsOverdue90Days,
        slm.broken_signatures as brokenSignatures,
        slm.crfs_never_signed as crfsNeverSigned,
        -- Calculate if high risk: >10 missing visits OR >50 open queries OR quality <75%
        CASE 
          WHEN slm.missing_visits > 10 OR slm.total_queries > 50 OR slm.percentage_clean_crf < 75 
          THEN 1 
          ELSE 0 
        END as isHighRisk,
        COALESCE(ROUND(slm.percentage_clean_crf), 0) as dataQualityScore,
        -- DQI Score and Clean Status from subject_dqi_clean_status table
        dqi.dqi_score as dqiScore,
        dqi.dqi_category as dqiCategory,
        CASE WHEN dqi.clean_status = 'Clean' THEN 1 ELSE 0 END as isClean
      FROM subject_level_metrics slm
      LEFT JOIN subject_dqi_clean_status dqi 
        ON slm.project_name = dqi.project_name 
        AND slm.site_id = dqi.site_id 
        AND slm.subject_id = dqi.subject_id
      ${whereClause}
      ORDER BY 
        CASE WHEN slm.subject_status = 'On Trial' THEN 1 ELSE 2 END,
        slm.total_queries DESC,
        slm.missing_visits DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as SubjectOverviewResult[];

    // Convert isHighRisk from number to boolean
    return results.map((row) => ({
      ...row,
      isHighRisk: Boolean(row.isHighRisk),
      isClean: row.isClean !== null ? Boolean(row.isClean) : null,
    }));
  } catch (error) {
    console.error("Error fetching subject overview data:", error);
    return [];
  }
}
