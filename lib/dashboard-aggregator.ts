import { DashboardContext } from "@/types/dashboard-context";
import { FilterState } from "@/types";

/**
 * Aggregate all dashboard data into a single context object
 * @param filters - Current filter state
 * @param data - All dashboard data from various APIs
 * @param sessionId - Session identifier
 * @returns Complete dashboard context
 */
export function aggregateDashboardContext(
    filters: FilterState,
    data: {
        kpi: any;
        studyPulse: any;
        regional: any[];
        countryPerformance: any[];
        subjectPerformance: any[];
        saeChart: any[];
        signatureCompliance: any[];
        sitePerformance: any[];
        subjectOverview: any[];
        patient360?: any;
    },
    sessionId: string,
    loadingStates: {
        loadingKPI: boolean;
        loadingStudyPulse: boolean;
        loadingRegionalData: boolean;
        loadingCountryPerformance: boolean;
        loadingSubjectPerformance: boolean;
        loadingSAEChart: boolean;
        loadingSignatureCompliance: boolean;
        loadingSitePerformance: boolean;
        loadingSubjectOverview: boolean;
    },
): DashboardContext {
    // Determine data quality based on loading states
    const anyLoading = Object.values(loadingStates).some((loading) => loading);
    const dataQuality: "complete" | "partial" | "loading" = anyLoading
        ? "loading"
        : "complete";

    // Create the context object
    const context: DashboardContext = {
        timestamp: new Date().toISOString(),
        sessionId,
        filters,
        data: {
            kpi: data.kpi || {
                totalMissingVisits: 0,
                openQueries: 0,
                seriousAdverseEvents: 0,
                uncodedTerms: 0,
            },
            studyPulse: data.studyPulse || {
                pagesEntered: 0,
                totalQueries: 0,
                activeSubjects: 0,
                missingPages: 0,
                cleanCRFPercentage: 0,
            },
            regional: data.regional || [],
            countryPerformance: data.countryPerformance || [],
            subjectPerformance: data.subjectPerformance || [],
            saeChart: data.saeChart || [],
            signatureCompliance: data.signatureCompliance || [],
            sitePerformance: data.sitePerformance || [],
            subjectOverview: data.subjectOverview || [],
            patient360: data.patient360,
        },
        metadata: {
            totalSubjects: data.subjectOverview?.length || 0,
            totalSites: data.sitePerformance?.length || 0,
            dataQuality,
            loadedAt: new Date().toISOString(),
        },
    };

    return context;
}

/**
 * Validate dashboard context
 * @param context - Dashboard context to validate
 * @returns true if valid
 */
export function validateDashboardContext(
    context: DashboardContext,
): boolean {
    if (!context || typeof context !== "object") {
        console.error("[Aggregator] Invalid context: not an object");
        return false;
    }

    if (!context.data || typeof context.data !== "object") {
        console.error("[Aggregator] Invalid context: missing data");
        return false;
    }

    if (!context.filters || typeof context.filters !== "object") {
        console.error("[Aggregator] Invalid context: missing filters");
        return false;
    }

    return true;
}

/**
 * Get context summary for logging
 * @param context - Dashboard context
 * @returns Summary string
 */
export function getContextSummary(context: DashboardContext): string {
    return `Context [${context.sessionId.substring(0, 8)}...]: ${context.metadata.totalSubjects} subjects, ${context.metadata.totalSites} sites, Quality: ${context.metadata.dataQuality}, Filters: ${JSON.stringify(context.filters)}`;
}
