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

    // ALL Subjects Overview (complete list with details)
    let subjectsDetailNote = "";
    if (data.subjectOverview && data.subjectOverview.length > 0) {
        subjectsDetailNote = `
Complete Subject List (${data.subjectOverview.length} subjects):
${data.subjectOverview
                .map(
                    (s: any) =>
                        `- ${s.subject_id}: Status="${s.status}", Latest Visit="${s.latest_visit}", Pages Entered=${s.pages_entered}, Missing Visits=${s.missing_visits}, Queries=${s.open_queries}, SAEs=${s.sae_count}`,
                )
                .join("\n")}
`.trim();
    }

    // Site performance highlight (if available)
    let sitePerformanceNote = "";
    if (data.sitePerformance && data.sitePerformance.length > 0) {
        const topSites = data.sitePerformance.slice(0, 3);
        sitePerformanceNote = `
Top Sites by Signature Backlog:
${topSites
                .map(
                    (site: any) =>
                        `- ${site.site_id} (${site.country}): ${site.pending_signatures} pending signatures`,
                )
                .join("\n")}
`.trim();
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

Subject: ${p.subject_id || "N/A"}
Status: ${p.status || "N/A"}
Site: ${p.site_id || "N/A"}

Demographics:
- Age: ${p.age || "N/A"}
- Gender: ${p.gender || "N/A"}
- Enrollment Date: ${p.enrollment_date || "N/A"}

Visit Information:
- Latest Visit: ${p.latest_visit || "N/A"}
- Total Visits Completed: ${p.visits_completed || 0}
- Missed Visits: ${p.missed_visits || 0}
- Upcoming Visits: ${p.upcoming_visits ? p.upcoming_visits.join(", ") : "None"}

Data Quality:
- Pages Entered: ${p.pages_entered || 0}
- Missing Pages: ${p.missing_pages || 0}
- Data Completion: ${p.data_completion_percentage || 0}%

Queries:
- Open Queries: ${p.open_queries || 0}
- Resolved Queries: ${p.resolved_queries || 0}
${p.query_details ? `- Query Categories: ${p.query_details.map((q: any) => `${q.category} (${q.count})`).join(", ")}` : ""}

Adverse Events:
- Total SAEs: ${p.total_saes || 0}
- Total AEs: ${p.total_aes || 0}
${p.sae_details ? `- SAE Details: ${p.sae_details.map((s: any) => `${s.term} (${s.severity}, ${s.status})`).join(", ")}` : ""}
${p.ae_details ? `- Recent AEs: ${p.ae_details.slice(0, 3).map((a: any) => a.term).join(", ")}` : ""}

Protocol Deviations:
- Total Deviations: ${p.protocol_deviations || 0}
${p.deviation_details ? `- Types: ${p.deviation_details.map((d: any) => d.type).join(", ")}` : ""}

Concomitant Medications:
${p.medications ? `- Current Medications: ${p.medications.map((m: any) => m.name).join(", ")}` : "- None recorded"}

Medical History:
${p.medical_history ? `- ${p.medical_history.join(", ")}` : "- None recorded"}

Notes:
${p.notes || "No additional notes"}

⭐ IMPORTANT: This patient is currently selected. Prioritize answering questions about THIS specific patient (${p.subject_id}) with the detailed information above.
`.trim();
    }

    // Construct the full system prompt
    const systemPrompt = `You are an AI assistant for the Clinical Trial Intelligence Engine (CTIE), a real-time monitoring and analytics platform for clinical trials.

ROLE AND CAPABILITIES:
You help clinical trial managers, data managers, and study coordinators by:
1. Analyzing trial data and identifying trends
2. Highlighting issues requiring attention (missing visits, open queries, SAEs)
3. Providing actionable recommendations
4. Explaining data patterns and anomalies
5. Answering questions about specific subjects, sites, or metrics

CURRENT CONTEXT:
${filterContext}

${metadataSummary}

AVAILABLE DATA:
${kpiSummary}

${studyPulseSummary}

${subjectsDetailNote}

${topIssuesNote}

${sitePerformanceNote}

${saeBreakdown}

${patient360Note}

GUIDELINES FOR RESPONSES:
1. **Be Specific**: Always reference exact numbers from the data above
2. **Be Concise**: Keep responses focused and actionable (2-3 paragraphs max)
3. **Be Positive**: Focus on insights and opportunities, not limitations
4. **Be Constructive**: Highlight priorities and suggest actionable next steps
5. **Work with Available Data**: Use the data you have without commenting on what's missing
6. **Provide Context**: Explain what the numbers mean in clinical trial terms
7. **Suggest Actions**: When relevant, suggest next steps (e.g., "Review Site_101's signature backlog" or "Follow up on subjects with multiple open queries")
8. **Filter Awareness**: If user asks about data not in current filters, suggest they can adjust filters to see more detail
9. **Stay Professional**: Use clinical trial terminology appropriately
10. **Be Solution-Focused**: Frame findings in terms of opportunities for improvement

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
