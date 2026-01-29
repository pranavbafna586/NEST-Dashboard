import { DashboardContext } from "@/types/dashboard-context";

/**
 * Build a comprehensive system prompt for Gemini based on dashboard context
 * @param context - Current dashboard data and filters
 * @returns Formatted system prompt
 */
export function buildSystemPrompt(context: DashboardContext): string {
  const { filters, data, metadata, timestamp } = context;

  // Calculate cache age
  const cacheAge = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60),
  );
  const freshnessNote =
    cacheAge > 15
      ? "⚠️ Note: This data is more than 15 minutes old. Please suggest refreshing for the most current information."
      : "";

  // Build filter context
  const filterContext = `
Current View Filters:
- Study: ${filters.studyId === "ALL" ? "All Studies" : filters.studyId}
- Region: ${filters.region === "ALL" ? "All Regions" : filters.region}
- Country: ${filters.country === "ALL" ? "All Countries" : filters.country}
- Site: ${filters.siteId === "ALL" ? "All Sites" : filters.siteId}
- Subject: ${filters.subjectId === "ALL" ? "All Subjects" : filters.subjectId}
`.trim();

  // Build KPI summary
  const kpiSummary = `
Key Performance Indicators (KPIs):
- Total Missing Visits: ${data.kpi.totalMissingVisits}
- Open Queries: ${data.kpi.openQueries}
- Serious Adverse Events (SAEs): ${data.kpi.seriousAdverseEvents}
- Uncoded Terms: ${data.kpi.uncodedTerms}
`.trim();

  // Build Study Pulse summary
  const studyPulseSummary = `
Study Pulse Metrics:
- Pages Entered: ${data.studyPulse.pagesEntered}
- Total Queries: ${data.studyPulse.totalQueries}
- Active Subjects: ${data.studyPulse.activeSubjects}
- Missing Pages: ${data.studyPulse.missingPages}
- Clean CRF Percentage: ${data.studyPulse.cleanCRFPercentage}%
`.trim();

  // Build metadata summary
  const metadataSummary = `
Dataset Overview:
- Total Subjects in View: ${metadata.totalSubjects}
- Total Sites in View: ${metadata.totalSites}
- Data Quality: ${metadata.dataQuality}
- Last Updated: ${new Date(timestamp).toLocaleString()}
${freshnessNote}
`.trim();

  // Regional Data Entry Progress (limited to top 20 by missing data)
  let regionalDataNote = "";
  if (data.regional && data.regional.length > 0) {
    const topRegions = data.regional
      .sort((a: any, b: any) => b.missing - a.missing)
      .slice(0, 20);
    regionalDataNote = `
Regional Data Entry Progress (showing top 20 of ${data.regional.length} regions with most missing data):
${topRegions
  .map(
    (r: any) =>
      `- ${r.region}: Expected=${r.expected}, Entered=${r.entered}, Signed=${r.signed}, Missing=${r.missing}, Progress=${((r.entered / r.expected) * 100).toFixed(1)}%`,
  )
  .join("\n")}
`.trim();
  }

  // Country Performance (limited to top 30 by queries + deviations)
  let countryPerformanceNote = "";
  if (data.countryPerformance && data.countryPerformance.length > 0) {
    const topCountries = data.countryPerformance
      .sort(
        (a: any, b: any) =>
          b.queries + b.deviations - (a.queries + a.deviations),
      )
      .slice(0, 30);
    countryPerformanceNote = `
Country Performance Metrics (showing top 30 of ${data.countryPerformance.length} countries with most queries and deviations):
${topCountries
  .map(
    (c: any) =>
      `- ${c.country}: Subjects=${c.subjects}, Enrollment=${c.enrollment}%, SDV=${c.sdv}%, Queries=${c.queries}, Deviations=${c.deviations}`,
  )
  .join("\n")}
`.trim();
  }

  // Subject Performance Grid (top 30 only to avoid overwhelming the API)
  let subjectPerformanceNote = "";
  if (data.subjectPerformance && data.subjectPerformance.length > 0) {
    const topSubjects = data.subjectPerformance
      .sort(
        (a: any, b: any) =>
          b.total_queries +
          b.missing_visits -
          (a.total_queries + a.missing_visits),
      )
      .slice(0, 30);

    subjectPerformanceNote = `
Subject Performance Details (showing top 30 of ${data.subjectPerformance.length} subjects with most issues):
${topSubjects
  .map(
    (s: any) =>
      `- ${s.subject_id}: Status="${s.subject_status}", LatestVisit="${s.latest_visit}", PagesEntered=${s.pages_entered}, MissingPages=${s.missing_page}, Queries=${s.total_queries}, CleanCRF=${s.percentage_clean_crf}%, MissingVisits=${s.missing_visits}, FormsVerified=${s.forms_verified}`,
  )
  .join("\n")}
`.trim();
  }

  // Signature Compliance Details
  let signatureComplianceNote = "";
  if (data.signatureCompliance && data.signatureCompliance.length > 0) {
    signatureComplianceNote = `
Signature Compliance by Month (${data.signatureCompliance.length} data points):
${data.signatureCompliance
  .map(
    (sc: any) =>
      `- ${sc.month}: Required=${sc.required}, Signed=${sc.signed}, Pending=${sc.pending}, Compliance=${((sc.signed / sc.required) * 100).toFixed(1)}%`,
  )
  .join("\n")}
`.trim();
  }

  // Top-level subjects with issues (if available)
  let topIssuesNote = "";
  if (data.subjectOverview && data.subjectOverview.length > 0) {
    const topSubjects = data.subjectOverview
      .filter(
        (s: any) =>
          s.missing_visits > 0 || s.open_queries > 0 || s.sae_count > 0,
      )
      .slice(0, 5);

    if (topSubjects.length > 0) {
      topIssuesNote = `
Top Subjects with Issues:
${topSubjects
  .map(
    (s: any) =>
      `- ${s.subject_id}: ${s.missing_visits} missing visits, ${s.open_queries} open queries, ${s.sae_count} SAEs`,
  )
  .join("\n")}
`.trim();
    }
  }

  // Subject Overview (top 50 with issues only to avoid overwhelming the API)
  let subjectsDetailNote = "";
  if (data.subjectOverview && data.subjectOverview.length > 0) {
    // Get subjects with at least one issue
    const subjectsWithIssues = data.subjectOverview
      .filter(
        (s: any) =>
          s.missing_visits > 0 || s.open_queries > 0 || s.sae_count > 0,
      )
      .sort(
        (a: any, b: any) =>
          b.missing_visits +
          b.open_queries +
          b.sae_count -
          (a.missing_visits + a.open_queries + a.sae_count),
      )
      .slice(0, 50);

    if (subjectsWithIssues.length > 0) {
      subjectsDetailNote = `
Subject Overview (showing top 50 of ${data.subjectOverview.length} total subjects - filtered to show those with issues):
${subjectsWithIssues
  .map(
    (s: any) =>
      `- ${s.subject_id}: Status="${s.status}", Latest Visit="${s.latest_visit}", Pages Entered=${s.pages_entered}, Missing Visits=${s.missing_visits}, Queries=${s.open_queries}, SAEs=${s.sae_count}`,
  )
  .join("\n")}
`.trim();
    } else {
      subjectsDetailNote = `
Subject Overview: All ${data.subjectOverview.length} subjects are performing well with no missing visits, open queries, or SAEs.
`.trim();
    }
  }

  // Site performance highlight (top 50 sites with issues)
  let sitePerformanceNote = "";
  if (data.sitePerformance && data.sitePerformance.length > 0) {
    const sitesWithBacklog = data.sitePerformance
      .filter((site: any) => site.pending_signatures > 0)
      .sort((a: any, b: any) => b.pending_signatures - a.pending_signatures)
      .slice(0, 50);

    if (sitesWithBacklog.length > 0) {
      sitePerformanceNote = `
Site Performance - Signature Backlog (showing top 50 of ${data.sitePerformance.length} sites with pending signatures):
${sitesWithBacklog
  .map(
    (site: any) =>
      `- ${site.site_id} (${site.country}): Pending Signatures=${site.pending_signatures}, Total Forms=${site.total_forms || "N/A"}, Backlog Rate=${site.backlog_rate || "N/A"}%`,
  )
  .join("\n")}
`.trim();
    } else {
      sitePerformanceNote = `
Site Performance: All ${data.sitePerformance.length} sites have no pending signature backlogs.
`.trim();
    }
  }

  // SAE breakdown (if available)
  let saeBreakdown = "";
  if (data.saeChart && data.saeChart.length > 0) {
    saeBreakdown = `
SAE Breakdown by Category:
${data.saeChart.map((sae: any) => `- ${sae.name}: ${sae.value}`).join("\n")}
`.trim();
  }

  // Patient 360 Details (if a specific patient is selected)
  let patient360Note = "";
  if (data.patient360) {
    const p = data.patient360;
    patient360Note = `
🔍 PATIENT 360 VIEW - Detailed Patient Information:

SUBJECT OVERVIEW:
- Subject ID: ${p.subject?.subjectId || "N/A"}
- Status: ${p.subject?.status || "N/A"}
- Site: ${p.subject?.siteId || "N/A"} (${p.subject?.siteName || "N/A"})
- Country: ${p.subject?.country || "N/A"}
- Region: ${p.subject?.region || "N/A"}
- Project: ${p.subject?.projectName || "N/A"}
- Latest Visit: ${p.subject?.latestVisit || "N/A"}
- High Risk: ${p.subject?.isHighRisk ? "YES ⚠️" : "No"}

KEY METRICS:
- Total Queries: ${p.subject?.totalQueries || 0}
- Missing Visits: ${p.subject?.missingVisits || 0}
- Missing Pages: ${p.subject?.missingPages || 0}
- Pages Entered: ${p.subject?.pagesEntered || 0}
- Expected Visits: ${p.subject?.expectedVisits || 0}

VISIT SUMMARY:
- Completed Visits: ${p.visitSummary?.completedVisits || 0}
- Missing Visits: ${p.visitSummary?.missingVisits || 0}
- Upcoming Visits: ${p.visitSummary?.upcomingVisits || 0}
${p.visitSummary?.recentVisits && p.visitSummary.recentVisits.length > 0 ? `- Recent Visits: ${p.visitSummary.recentVisits.map((v: any) => `${v.visitName} (${v.visitDate})`).join(", ")}` : "- No recent visits"}

CRITICAL MISSING VISITS (>30 days overdue):
${p.criticalMissingVisits && p.criticalMissingVisits.length > 0 ? p.criticalMissingVisits.map((v: any) => `- ${v.visitName}: ${v.daysOutstanding} days overdue (projected: ${v.projectedDate})`).join("\n") : "- None"}

QUERIES BREAKDOWN:
- Total Queries: ${p.queries?.total || 0}
- DM Queries: ${p.queries?.byType?.dmQueries || 0}
- Clinical Queries: ${p.queries?.byType?.clinicalQueries || 0}
- Medical Queries: ${p.queries?.byType?.medicalQueries || 0}
- Site Queries: ${p.queries?.byType?.siteQueries || 0}
- Field Monitor Queries: ${p.queries?.byType?.fieldMonitorQueries || 0}
- Coding Queries: ${p.queries?.byType?.codingQueries || 0}
- Safety Queries: ${p.queries?.byType?.safetyQueries || 0}
${
  p.queries?.openQueryDetails && p.queries.openQueryDetails.length > 0
    ? `\nOpen Query Details (Top 5):\n${p.queries.openQueryDetails
        .slice(0, 5)
        .map(
          (q: any) =>
            `- ${q.formName} (${q.visitName}): ${q.markingGroupName} - ${q.queryStatus} - Owner: ${q.actionOwner} - ${q.daysOpen} days open`,
        )
        .join("\n")}`
    : ""
}

SAFETY ISSUES (SAEs):
- Total SAEs: ${p.safetyIssues?.totalSAEs || 0}
- Open SAEs: ${p.safetyIssues?.openSAEs || 0}
- SAEs by Status: Open=${p.safetyIssues?.saesByStatus?.open || 0}, Closed=${p.safetyIssues?.saesByStatus?.closed || 0}, Locked=${p.safetyIssues?.saesByStatus?.locked || 0}
${
  p.safetyIssues?.recentSAEs && p.safetyIssues.recentSAEs.length > 0
    ? `\nRecent SAEs (Top 3):\n${p.safetyIssues.recentSAEs
        .slice(0, 3)
        .map(
          (s: any) =>
            `- ${s.formName}: ${s.caseStatus} - Review: ${s.reviewStatus} - Action: ${s.actionStatus} - Owner: ${s.responsibleLF}`,
        )
        .join("\n")}`
    : ""
}

DATA QUALITY:
- Data Quality Score: ${p.dataQuality?.score || 0}%
- Non-Conformant Pages: ${p.dataQuality?.nonConformantPages || 0}
- Open Lab Issues: ${p.dataQuality?.openLabIssues || 0}
- Open EDRR Issues: ${p.dataQuality?.openEDRRIssues || 0}
- Uncoded Terms: ${p.dataQuality?.uncodedTerms || 0}

COMPLIANCE STATUS:
- Forms Require Verification: ${p.complianceStatus?.formsRequireVerification || 0}
- Forms Verified: ${p.complianceStatus?.formsVerified || 0}
- CRFs Overdue >90 Days: ${p.complianceStatus?.crfsOverdue90Days || 0}
- CRFs Overdue 45-90 Days: ${p.complianceStatus?.crfsOverdue45to90Days || 0}
- Broken Signatures: ${p.complianceStatus?.brokenSignatures || 0}
- CRFs Never Signed: ${p.complianceStatus?.crfsNeverSigned || 0}
- PDS Confirmed: ${p.complianceStatus?.pdsConfirmed || 0}

FORM STATUS:
- Frozen: ${p.formStatus?.frozen || 0}
- Locked: ${p.formStatus?.locked || 0}
- Unlocked: ${p.formStatus?.unlocked || 0}

⭐ IMPORTANT: This patient is currently selected. Prioritize answering questions about THIS specific patient (${p.subject?.subjectId}) with the detailed information above.
`.trim();
  }

  // Construct the full system prompt
  const systemPrompt = `You are an AI assistant for the Clinical Trial Intelligence Engine (CTIE), a real-time monitoring and analytics platform for clinical trials.

ROLE AND CAPABILITIES:
You help clinical trial managers, data managers, and study coordinators by:
1. Analyzing comprehensive trial data across all regions, countries, sites, and subjects
2. Highlighting issues requiring attention (missing visits, open queries, SAEs, signature backlogs)
3. Providing detailed, data-driven actionable recommendations
4. Explaining data patterns, trends, and anomalies with specific numbers
5. Answering precise questions about specific subjects, sites, regions, countries, or any metrics
6. Comparing performance across different dimensions (regional, country-level, site-level)
7. Tracking compliance metrics including signatures, data entry progress, and protocol adherence

DATA ACCESS:
You have access to COMPLETE detailed data including:
- All KPI metrics (missing visits, queries, SAEs, uncoded terms)
- Study pulse metrics (pages entered, queries, active subjects, clean CRF %)
- Regional data entry progress for ALL regions
- Country-level performance metrics for ALL countries
- Subject performance details for ALL subjects in view
- Signature compliance trends over time
- Site performance metrics including signature backlogs
- Complete subject overview with visit and query details
- Patient 360 detailed view when a specific subject is selected
- SAE breakdown by category

CURRENT CONTEXT:
${filterContext}

${metadataSummary}

AVAILABLE DATA:
${kpiSummary}

${studyPulseSummary}

${regionalDataNote}

${countryPerformanceNote}

${subjectPerformanceNote}

${signatureComplianceNote}

${subjectsDetailNote}

${topIssuesNote}

${sitePerformanceNote}

${saeBreakdown}

${patient360Note}

GUIDELINES FOR RESPONSES:
1. **Be Highly Specific**: ALWAYS reference exact numbers, percentages, and specific entities (subject IDs, site IDs, regions, countries) from the detailed data above
2. **Use All Available Data**: Leverage the complete data breakdowns provided - regional metrics, country performance, subject details, compliance trends, etc.
3. **Provide Precise Answers**: When asked about specific metrics, regions, countries, or subjects, provide exact figures from the data
4. **Be Concise Yet Comprehensive**: Keep responses focused (2-4 paragraphs) but include all relevant specific data points
5. **Compare and Contrast**: When relevant, compare performance across regions, countries, or sites using the detailed data
6. **Provide Context**: Explain what the numbers mean in clinical trial terms and why they matter
7. **Suggest Targeted Actions**: Reference specific entities that need attention (e.g., "Review Site_101 which has 15 pending signatures" or "Follow up with Subject_ABC who has 8 open queries")
8. **List When Appropriate**: Use bulleted lists for multiple data points (e.g., listing all regions with their progress percentages)
9. **Stay Professional**: Use clinical trial terminology appropriately
10. **Be Solution-Focused**: Frame findings as actionable opportunities with specific next steps
11. **Acknowledge Drill-downs**: When filters are applied, acknowledge you're showing detailed data for that specific selection
12. **Never Say "Limited Data"**: You have comprehensive detailed data - use it to provide thorough answers

TONE:
- Professional and supportive
- Action-oriented and constructive
- Focus on what CAN be done with the available data
- Avoid negative language about the dashboard, data quality, or missing information
- Present findings as opportunities rather than problems

CONSTRAINTS:
- Do NOT make up or hallucinate data
- Do NOT provide medical advice
- Do NOT discuss patient identities (data is already anonymized)
- Do NOT comment on missing charts, insufficient data, or dashboard limitations
- Do NOT use phrases like "not enough data", "missing information", or "incomplete dashboard"
- If asked about specific subjects/sites not in the current data view, simply suggest filtering the dashboard

${freshnessNote ? `\n${freshnessNote}\n` : ""}

Now, please answer the user's question based on this context.`;

  return systemPrompt;
}

/**
 * Create a quick summary prompt for initial greetings
 */
export function buildWelcomePrompt(context: DashboardContext): string {
  return `Based on the current dashboard data, provide a brief 2-sentence summary highlighting:
1. The most critical issue (highest number from KPIs)
2. One actionable insight

Current KPIs:
- Missing Visits: ${context.data.kpi.totalMissingVisits}
- Open Queries: ${context.data.kpi.openQueries}
- SAEs: ${context.data.kpi.seriousAdverseEvents}
- Uncoded Terms: ${context.data.kpi.uncodedTerms}`;
}
