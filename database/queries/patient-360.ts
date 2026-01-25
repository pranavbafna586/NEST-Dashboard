import { getDatabase } from "../db";

export interface Patient360Data {
  subject: {
    subjectId: string;
    siteId: string;
    siteName: string;
    country: string;
    region: string;
    projectName: string;
    status: string;
    latestVisit: string;
    isHighRisk: boolean;
    // Key metrics summary
    totalQueries: number;
    missingVisits: number;
    missingPages: number;
    pagesEntered: number;
    expectedVisits: number;
  };
  // Visit summary (not full list)
  visitSummary: {
    completedVisits: number;
    missingVisits: number;
    upcomingVisits: number;
    recentVisits: Array<{
      visitName: string;
      visitDate: string;
      status: string;
    }>;
  };
  // Critical missing visits (only overdue ones)
  criticalMissingVisits: Array<{
    visitName: string;
    daysOutstanding: number;
    projectedDate: string;
  }>;
  // Query breakdown by type (actionable)
  queries: {
    total: number;
    byType: {
      dmQueries: number;
      clinicalQueries: number;
      medicalQueries: number;
      siteQueries: number;
      fieldMonitorQueries: number;
      codingQueries: number;
      safetyQueries: number;
    };
    openQueryDetails?: Array<{
      formName: string;
      visitName: string;
      markingGroupName: string;
      queryStatus: string;
      actionOwner: string;
      daysOpen: number;
    }>;
  };
  // Safety - SAE issues
  safetyIssues: {
    totalSAEs: number;
    openSAEs: number;
    saesByStatus: {
      open: number;
      closed: number;
      locked: number;
    };
    recentSAEs: Array<{
      discrepancyId: string;
      formName: string;
      caseStatus: string;
      reviewStatus: string;
      actionStatus: string;
      responsibleLF: string;
      createdTimestamp: string;
    }>;
  };
  // Data quality issues
  dataQuality: {
    score: number;
    nonConformantPages: number;
    openLabIssues: number;
    openEDRRIssues: number;
    uncodedTerms: number;
  };
  // Verification & signature status
  complianceStatus: {
    formsRequireVerification: number;
    formsVerified: number;
    crfsOverdue90Days: number;
    crfsOverdue45to90Days: number;
    brokenSignatures: number;
    crfsNeverSigned: number;
    pdsConfirmed: number;
    pdsProposed: number;
  };
  // Form lock status
  formStatus: {
    frozen: number;
    locked: number;
    unlocked: number;
  };
}

/**
 * Get Patient 360 View Data - COMPREHENSIVE CRITICAL METRICS
 * Focuses on actionable data: queries, safety, compliance, and data quality
 *
 * @param subjectId - Subject ID to fetch data for
 * @param study - Optional study/project filter
 * @returns Patient 360 data object with critical metrics
 */
export function getPatient360Data(
  subjectId: string,
  study?: string,
): Patient360Data | null {
  try {
    const database = getDatabase();

    // Build WHERE clause
    const params: string[] = [subjectId];
    let whereClause = "WHERE subject_id = ?";
    if (study && study !== "ALL") {
      whereClause += " AND project_name = ?";
      params.push(study);
    }

    // 1. GET SUBJECT COMPREHENSIVE DATA from subject_level_metrics
    const subjectQuery = `
      SELECT 
        subject_id as subjectId,
        site_id as siteId,
        site_id as siteName,
        country,
        region,
        project_name as projectName,
        subject_status as status,
        latest_visit as latestVisit,
        -- Key metrics
        total_queries as totalQueries,
        missing_visits as missingVisits,
        missing_page as missingPages,
        pages_entered as pagesEntered,
        expected_visits as expectedVisits,
        -- Query breakdown
        dm_queries as dmQueries,
        clinical_queries as clinicalQueries,
        medical_queries as medicalQueries,
        site_queries as siteQueries,
        field_monitor_queries as fieldMonitorQueries,
        coding_queries as codingQueries,
        safety_queries as safetyQueries,
        -- Data quality
        percentage_clean_crf as dataQualityScore,
        pages_non_conformant as nonConformantPages,
        open_issues_in_lnr as openLabIssues,
        open_issues_edrr as openEDRRIssues,
        uncoded_terms as uncodedTerms,
        -- Compliance
        crfs_require_verification as formsRequireVerification,
        forms_verified as formsVerified,
        crfs_overdue_beyond_90_days as crfsOverdue90Days,
        crfs_overdue_45_to_90_days as crfsOverdue45to90Days,
        broken_signatures as brokenSignatures,
        crfs_never_signed as crfsNeverSigned,
        pds_confirmed as pdsConfirmed,
        -- Form status
        crfs_frozen as frozen,
        crfs_locked as locked,
        crfs_unlocked as unlocked,
        -- Safety
        esae_dashboard_dm as esaeDM,
        esae_dashboard_safety as esaeSafety,
        -- High risk flag
        CASE 
          WHEN missing_visits > 10 OR total_queries > 50 OR percentage_clean_crf < 75 
          THEN 1 ELSE 0 
        END as isHighRisk
      FROM subject_level_metrics
      ${whereClause}
      LIMIT 1
    `;

    const subjectStmt = database.prepare(subjectQuery);
    const subjectData = subjectStmt.get(...params) as any;

    if (!subjectData) {
      return null;
    }

    // 2. GET VISIT COUNTS & RECENT VISITS
    const completedVisitsQuery = `
      SELECT 
        visit_name as visitName,
        visit_date as visitDate
      FROM completed_visits
      ${whereClause}
      ORDER BY visit_date DESC
      LIMIT 5
    `;
    const completedVisitsStmt = database.prepare(completedVisitsQuery);
    const recentVisits = completedVisitsStmt.all(...params) as Array<{
      visitName: string;
      visitDate: string;
    }>;

    const completedCountQuery = `
      SELECT COUNT(*) as count FROM completed_visits ${whereClause}
    `;
    const completedCountStmt = database.prepare(completedCountQuery);
    const completedCount =
      (completedCountStmt.get(...params) as any)?.count || 0;

    // 3. GET CRITICAL MISSING VISITS (>30 days overdue only)
    const criticalMissingQuery = `
      SELECT 
        visit_name as visitName,
        days_outstanding as daysOutstanding,
        projected_date as projectedDate
      FROM missing_visits
      ${whereClause} AND days_outstanding > 30
      ORDER BY days_outstanding DESC
    `;
    const criticalMissingStmt = database.prepare(criticalMissingQuery);
    const criticalMissing = criticalMissingStmt.all(...params) as Array<{
      visitName: string;
      daysOutstanding: number;
      projectedDate: string;
    }>;

    // 4. GET OPEN QUERY DETAILS (Most recent 10)
    const queryDetailsQuery = `
      SELECT 
        form_name as formName,
        visit_name as visitName,
        marking_group_name as markingGroupName,
        query_status as queryStatus,
        action_owner as actionOwner,
        days_since_open as daysOpen
      FROM query_report
      ${whereClause} AND query_status = 'Open'
      ORDER BY days_since_open DESC
      LIMIT 10
    `;
    const queryDetailsStmt = database.prepare(queryDetailsQuery);
    const openQueryDetails = queryDetailsStmt.all(...params) as Array<{
      formName: string;
      visitName: string;
      markingGroupName: string;
      queryStatus: string;
      actionOwner: string;
      daysOpen: number;
    }>;

    // 5. GET SAE DETAILS (Recent 10)
    const saesQuery = `
      SELECT 
        discrepancy_id as discrepancyId,
        form_name as formName,
        CASE 
          WHEN case_status IS NULL OR case_status = '' OR case_status = '-' 
          THEN 'Open' 
          ELSE case_status 
        END as caseStatus,
        review_status as reviewStatus,
        action_status as actionStatus,
        responsible_lf as responsibleLF,
        discrepancy_created_timestamp as createdTimestamp
      FROM sae_issues
      ${whereClause}
      ORDER BY discrepancy_created_timestamp DESC
      LIMIT 10
    `;
    const saesStmt = database.prepare(saesQuery);
    const recentSAEs = saesStmt.all(...params) as Array<{
      discrepancyId: string;
      formName: string;
      caseStatus: string;
      reviewStatus: string;
      actionStatus: string;
      responsibleLF: string;
      createdTimestamp: string;
    }>;

    // Count SAE statuses
    const saeCountQuery = `
      SELECT 
        CASE 
          WHEN case_status IS NULL OR case_status = '' OR case_status = '-' 
          THEN 'Open' 
          ELSE case_status 
        END as status,
        COUNT(*) as count
      FROM sae_issues
      ${whereClause}
      GROUP BY status
    `;
    const saeCountStmt = database.prepare(saeCountQuery);
    const saeCounts = saeCountStmt.all(...params) as Array<{
      status: string;
      count: number;
    }>;

    const saesByStatus = {
      open: saeCounts.find((s) => s.status === "Open")?.count || 0,
      closed: saeCounts.find((s) => s.status === "Closed")?.count || 0,
      locked: saeCounts.find((s) => s.status === "Locked")?.count || 0,
    };
    const totalSAEs = saeCounts.reduce((sum, s) => sum + s.count, 0);
    const openSAEs = saesByStatus.open;

    // BUILD RETURN OBJECT
    return {
      subject: {
        subjectId: subjectData.subjectId,
        siteId: subjectData.siteId,
        siteName: subjectData.siteName,
        country: subjectData.country,
        region: subjectData.region,
        projectName: subjectData.projectName,
        status: subjectData.status,
        latestVisit: subjectData.latestVisit,
        isHighRisk: Boolean(subjectData.isHighRisk),
        totalQueries: subjectData.totalQueries || 0,
        missingVisits: subjectData.missingVisits || 0,
        missingPages: subjectData.missingPages || 0,
        pagesEntered: subjectData.pagesEntered || 0,
        expectedVisits: subjectData.expectedVisits || 0,
      },
      visitSummary: {
        completedVisits: completedCount,
        missingVisits: subjectData.missingVisits || 0,
        upcomingVisits: Math.max(
          0,
          (subjectData.expectedVisits || 0) -
            completedCount -
            (subjectData.missingVisits || 0),
        ),
        recentVisits: recentVisits.map((v) => ({
          visitName: v.visitName,
          visitDate: v.visitDate,
          status: "Completed",
        })),
      },
      criticalMissingVisits: criticalMissing,
      queries: {
        total: subjectData.totalQueries || 0,
        byType: {
          dmQueries: subjectData.dmQueries || 0,
          clinicalQueries: subjectData.clinicalQueries || 0,
          medicalQueries: subjectData.medicalQueries || 0,
          siteQueries: subjectData.siteQueries || 0,
          fieldMonitorQueries: subjectData.fieldMonitorQueries || 0,
          codingQueries: subjectData.codingQueries || 0,
          safetyQueries: subjectData.safetyQueries || 0,
        },
        openQueryDetails,
      },
      safetyIssues: {
        totalSAEs,
        openSAEs,
        saesByStatus,
        recentSAEs,
      },
      dataQuality: {
        score: Math.round(subjectData.dataQualityScore || 0),
        nonConformantPages: subjectData.nonConformantPages || 0,
        openLabIssues: subjectData.openLabIssues || 0,
        openEDRRIssues: subjectData.openEDRRIssues || 0,
        uncodedTerms: subjectData.uncodedTerms || 0,
      },
      complianceStatus: {
        formsRequireVerification: subjectData.formsRequireVerification || 0,
        formsVerified: subjectData.formsVerified || 0,
        crfsOverdue90Days: subjectData.crfsOverdue90Days || 0,
        crfsOverdue45to90Days: subjectData.crfsOverdue45to90Days || 0,
        brokenSignatures: subjectData.brokenSignatures || 0,
        crfsNeverSigned: subjectData.crfsNeverSigned || 0,
        pdsConfirmed: subjectData.pdsConfirmed || 0,
        pdsProposed: 0, // Not in subject_level_metrics, would need protocol_deviation table
      },
      formStatus: {
        frozen: subjectData.frozen || 0,
        locked: subjectData.locked || 0,
        unlocked: subjectData.unlocked || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching patient 360 data:", error);
    return null;
  }
}
