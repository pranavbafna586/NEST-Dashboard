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

    const query = `
      SELECT 
        subject_id as subjectId,
        site_id as siteId,
        site_id as siteName,
        country,
        region,
        project_name as studyId,
        project_name as projectName,
        subject_status as status,
        latest_visit as latestVisit,
        missing_visits as missingVisits,
        missing_page as missingPages,
        coded_terms as codedTerms,
        uncoded_terms as uncodedTerms,
        open_issues_in_lnr as openLabIssues,
        open_issues_edrr as openEDRRIssues,
        inactivated_forms_folders as inactivatedForms,
        esae_dashboard_dm as saeDMReview,
        esae_dashboard_safety as saeSafetyReview,
        expected_visits as expectedVisits,
        pages_entered as pagesEntered,
        pages_non_conformant as pagesNonConformant,
        dm_queries as queriesDM,
        clinical_queries as queriesClinical,
        medical_queries as queriesMedical,
        site_queries as queriesSite,
        field_monitor_queries as queriesFieldMonitor,
        coding_queries as queriesCoding,
        safety_queries as queriesSafety,
        total_queries as totalQueries,
        crfs_require_verification as crfsRequireVerification,
        forms_verified as formsVerified,
        crfs_frozen as crfsFrozen,
        crfs_not_frozen as crfsNotFrozen,
        crfs_locked as crfsLocked,
        crfs_unlocked as crfsUnlocked,
        pds_confirmed as pdsConfirmed,
        crfs_signed as crfsSigned,
        crfs_overdue_within_45_days as crfsOverdue45Days,
        crfs_overdue_45_to_90_days as crfsOverdue45to90Days,
        crfs_overdue_beyond_90_days as crfsOverdue90Days,
        broken_signatures as brokenSignatures,
        crfs_never_signed as crfsNeverSigned,
        -- Calculate if high risk: >10 missing visits OR >50 open queries OR quality <75%
        CASE 
          WHEN missing_visits > 10 OR total_queries > 50 OR percentage_clean_crf < 75 
          THEN 1 
          ELSE 0 
        END as isHighRisk,
        COALESCE(ROUND(percentage_clean_crf), 0) as dataQualityScore
      FROM subject_level_metrics
      ${whereClause}
      ORDER BY 
        CASE WHEN subject_status = 'On Trial' THEN 1 ELSE 2 END,
        total_queries DESC,
        missing_visits DESC
    `;

    const stmt = database.prepare(query);
    const results = stmt.all(...params) as SubjectOverviewResult[];

    // Convert isHighRisk from number to boolean
    return results.map((row) => ({
      ...row,
      isHighRisk: Boolean(row.isHighRisk),
    }));
  } catch (error) {
    console.error("Error fetching subject overview data:", error);
    return [];
  }
}
