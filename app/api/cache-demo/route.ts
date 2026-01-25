import { NextResponse } from "next/server";
import { getCacheStats } from "@/lib/cache-service";

/**
 * GET /api/cache-demo
 * Demo endpoint to view cache contents and structure
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");
        const full = searchParams.get("full") === "true"; // Show full data

        // Get cache statistics
        const stats = getCacheStats();

        // Import cache dynamically to access it
        const cacheModule = await import("@/lib/cache-service");
        const cachedContext = sessionId
            ? cacheModule.getCachedContext(sessionId)
            : null;

        if (!cachedContext && sessionId) {
            return NextResponse.json({
                error: "No cached data found for this session",
                sessionId,
                hint: "Make sure you've visited the dashboard first to cache data",
            });
        }

        if (!sessionId) {
            // Just return stats
            return NextResponse.json({
                cacheInfo: {
                    location: "Server-side in-memory Map (lib/cache-service.ts)",
                    ttl: "15 minutes",
                    maxSize: "1000 sessions",
                    cleanupInterval: "5 minutes",
                },
                statistics: stats,
                instructions: {
                    step1:
                        "Get your session ID from localStorage.getItem('dashboardSessionId') in browser console",
                    step2: "Visit /api/cache-demo?sessionId=YOUR_SESSION_ID to see cached data",
                    step3: "Add &full=true to see COMPLETE data: /api/cache-demo?sessionId=YOUR_SESSION_ID&full=true",
                },
            });
        }

        // At this point, cachedContext is guaranteed to be non-null
        if (!cachedContext) {
            return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
        }

        // Return cached data
        const response: any = {
            cacheInfo: {
                location: "Server-side in-memory Map (lib/cache-service.ts)",
                ttl: "15 minutes",
                status: "✅ ALL data is cached (not just numbers!)",
            },
            sessionId,
            timestamp: cachedContext.timestamp,
            filters: cachedContext.filters,
            metadata: cachedContext.metadata,
        };

        if (full) {
            // Show COMPLETE cached data
            response.completeData = {
                kpi: cachedContext.data.kpi,
                studyPulse: cachedContext.data.studyPulse,

                subjectOverview: {
                    count: cachedContext.data.subjectOverview?.length || 0,
                    sample: cachedContext.data.subjectOverview?.slice(0, 3) || [],
                    note: "Showing first 3 subjects. Full data is cached!",
                    fullData: cachedContext.data.subjectOverview || []
                },

                sitePerformance: {
                    count: cachedContext.data.sitePerformance?.length || 0,
                    fullData: cachedContext.data.sitePerformance || []
                },

                saeChart: {
                    count: cachedContext.data.saeChart?.length || 0,
                    fullData: cachedContext.data.saeChart || []
                },

                signatureCompliance: {
                    count: cachedContext.data.signatureCompliance?.length || 0,
                    fullData: cachedContext.data.signatureCompliance || []
                },

                regional: {
                    count: cachedContext.data.regional?.length || 0,
                    fullData: cachedContext.data.regional || []
                },

                countryPerformance: {
                    count: cachedContext.data.countryPerformance?.length || 0,
                    fullData: cachedContext.data.countryPerformance || []
                },

                subjectPerformance: {
                    count: cachedContext.data.subjectPerformance?.length || 0,
                    fullData: cachedContext.data.subjectPerformance || []
                },
            };
        } else {
            // Show preview with actual data samples
            response.dataSummary = {
                kpi: cachedContext.data.kpi,
                studyPulse: cachedContext.data.studyPulse,

                subjectOverview: {
                    totalCount: cachedContext.data.subjectOverview?.length || 0,
                    preview: cachedContext.data.subjectOverview?.slice(0, 3) || [],
                    note: "✅ Includes subject IDs, statuses, visits, queries, etc. - Add &full=true to see all"
                },

                sitePerformance: {
                    totalCount: cachedContext.data.sitePerformance?.length || 0,
                    preview: cachedContext.data.sitePerformance?.slice(0, 2) || [],
                    note: "✅ Includes site IDs, countries, signatures, etc."
                },

                saeChart: {
                    totalCount: cachedContext.data.saeChart?.length || 0,
                    preview: cachedContext.data.saeChart || [],
                    note: "✅ Includes SAE categories and counts"
                },

                signatureCompliance: {
                    totalCount: cachedContext.data.signatureCompliance?.length || 0,
                    preview: cachedContext.data.signatureCompliance?.slice(0, 2) || [],
                    note: "✅ Includes signature statuses and counts"
                }
            };

            response.note = "This is a PREVIEW. Add &full=true to URL to see complete cached data";
        }

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("[Cache Demo] Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve cache demo" },
            { status: 500 },
        );
    }
}
