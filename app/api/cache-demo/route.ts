/**
 * Cache Demo API Endpoint
 * 
 * PURPOSE:
 * Developer/debug endpoint to inspect cached dashboard context and verify cache operation.
 * Shows what data is being stored and cached for AI chat functionality.
 * 
 * BUSINESS CONTEXT - Debugging AI Chat Issues:
 * When AI chat gives unexpected answers, developers/admins need to verify:
 * - Is context being cached correctly?
 * - What data is the AI actually seeing?
 * - Is the cache stale or corrupted?
 * - How long has this session's cache been active?
 * 
 * TWO MODES OF OPERATION:
 * 
 * 1. **Statistics Mode** (no sessionId parameter):
 *    GET /api/cache-demo
 *    Returns:
 *    - Cache configuration (TTL, max size, cleanup interval)
 *    - Global cache statistics (total sessions, memory usage)
 *    - Instructions on how to view specific session data
 * 
 * 2. **Session Inspection Mode** (with sessionId):
 *    GET /api/cache-demo?sessionId=abc123
 *    Returns:
 *    - Session metadata (timestamp, filters, age)
 *    - Data summary counts (how many subjects, sites, queries, etc.)
 *    - Preview of first few rows of each dataset
 *    
 *    GET /api/cache-demo?sessionId=abc123&full=true
 *    Returns:
 *    - Everything above PLUS
 *    - Complete cached data (all rows, all tables)
 *    - WARNING: Can be very large response (100+ KB)
 * 
 * HOW TO USE:
 * 1. Open dashboard in browser
 * 2. Open browser console
 * 3. Check sessionId: `localStorage.getItem('dashboardSessionId')`
 * 4. Visit: `/api/cache-demo?sessionId=<your-session-id>`
 * 5. Verify data counts match dashboard display
 * 6. Add `&full=true` to see complete cached data if needed
 * 
* SECURITY NOTE:
 * - This endpoint exposes cached data without authentication
 * - Should be disabled or protected in production
 * - Or implement session ownership verification
 * 
 * USE CASES:
 * - Debug why AI chat is giving wrong answers (check what data it sees)
 * - Verify cache is persisting correctly between requests
 * - Troubleshoot filter application (check cached filters match UI)
 * - Performance testing (see cache memory footprint)
 */

import { NextResponse } from "next/server";
import { getCacheStats } from "@/lib/cache-service";

/**
 * GET /api/cache-demo
 * Demo endpoint to view cache contents and structure
 * 
 * Query Parameters:
 *   - sessionId: (optional) View cached data for specific session
 *   - full: (optional) If "true", show complete data instead of preview
 * 
 * @returns Cache statistics or session data preview/full data
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

        // If sessionId provided but no data found
        if (!cachedContext && sessionId) {
            return NextResponse.json({
                error: "No cached data found for this session",
                sessionId,
                hint: "Make sure you've visited the dashboard first to cache data",
            });
        }

        // If no sessionId, return statistics and instructions
        if (!sessionId) {
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
            // Show COMPLETE cached data (can be large!)
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
