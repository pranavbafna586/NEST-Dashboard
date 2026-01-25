import { FilterState } from "./index";

export interface DashboardContext {
    timestamp: string;
    sessionId: string;
    filters: FilterState;
    data: {
        kpi: {
            totalMissingVisits: number;
            openQueries: number;
            seriousAdverseEvents: number;
            uncodedTerms: number;
        };
        studyPulse: {
            pagesEntered: number;
            totalQueries: number;
            activeSubjects: number;
            missingPages: number;
            cleanCRFPercentage: number;
        };
        regional: any[];
        countryPerformance: any[];
        subjectPerformance: any[];
        saeChart: any[];
        signatureCompliance: any[];
        sitePerformance: any[];
        subjectOverview: any[];
        patient360?: any;
    };
    metadata: {
        totalSubjects: number;
        totalSites: number;
        dataQuality: "complete" | "partial" | "loading";
        loadedAt: string;
    };
}

export interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface ChatRequest {
    message: string;
    sessionId: string;
    context?: DashboardContext;
}

export interface ChatResponse {
    message: string;
    timestamp: string;
    dataQuality: string;
    cacheAge?: number; // in minutes
}
