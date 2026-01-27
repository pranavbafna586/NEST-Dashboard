/**
 * Dashboard Context Cache API Endpoint
 * 
 * PURPOSE:
 * Stores aggregated dashboard data in server-side cache to support AI chat functionality.
 * Enables Gemini AI to access user's current dashboard state without resending all data on every chat message.
 * 
 * BUSINESS CONTEXT - Why Cache Dashboard Data?
 * The AI chat feature needs access to user's filtered dashboard data to answer questions.
 * Sending full dashboard context (100+ rows across 10+ tables) on every chat message would be:
 * - Expensive: Gemini charges per input token
 * - Slow: Large payloads increase latency
 * - Wasteful: Same data sent repeatedly within a session
 * 
 * CACHING STRATEGY:
 * 1. Dashboard initially loads and aggregates all data
 * 2. Aggregated DashboardContext sent to this endpoint once
 * 3. Cached server-side with 15-minute TTL
 * 4. Chat messages reference sessionId instead of sending full context
 * 5. /api/chat retrieves cached context for Gemini analysis
 * 
 * WHAT IS CACHED:
 * Complete DashboardContext object including:
 * - All KPI values (active subjects, queries, deviations, etc.)
 * - Site performance data (all sites with metrics)
 * - Subject overview data (all subjects in current filter)
 * - Country performance, SAE data, signature compliance
 * - Regional data entry, study pulse, patient 360 data
 * - Applied filters (study, region, country, site, subject)
 * - Metadata (timestamp, data quality score)
 * 
 * CACHE IMPLEMENTATION:
 * - Storage: In-memory Map (lib/cache-service.ts)
 * - TTL: 15 minutes (configurable via CACHE_TTL_MINUTES env var)
 * - Cleanup: Automatic every 5 minutes to remove stale entries
 * - Isolation: Each sessionId has independent cached context
 * - Size: Max 1000 sessions (configurable, prevents memory exhaustion)
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Current implementation: In-memory (lost on server restart)
 * - Production recommendation: Redis or Memcached for multi-server deployments
 * - Alternative: Client-side caching with encrypted localStorage
 * 
 * DATA VALIDATION:
 * - Validates DashboardContext structure before caching
 * - Ensures required fields present (sessionId, timestamp, data, metadata)
 * - Prevents malformed data from breaking AI chat
 * 
 * USE IN DASHBOARD:
 * Called automatically when dashboard finishes loading data, before user opens chat widget.
 */

import { NextResponse } from "next/server";
import { setCachedContext } from "@/lib/cache-service";
import {
    validateDashboardContext,
    getContextSummary,
} from "@/lib/dashboard-aggregator";
import { DashboardContext } from "@/types/dashboard-context";

/**
 * POST /api/cache-context
 * Cache dashboard context for a session
 * 
 * @param request - HTTP request with DashboardContext body
 * @returns Success response with sessionId and data quality indicator
 */
export async function POST(request: Request) {
    try {
        const body: DashboardContext = await request.json();

        // Validate the context structure
        if (!validateDashboardContext(body)) {
            return NextResponse.json(
                { error: "Invalid dashboard context" },
                { status: 400 },
            );
        }

        // Cache the context with sessionId as key
        setCachedContext(body.sessionId, body);

        console.log(`[Cache API] ${getContextSummary(body)}`);

        return NextResponse.json({
            success: true,
            sessionId: body.sessionId,
            timestamp: body.timestamp,
            dataQuality: body.metadata.dataQuality,
        });
    } catch (error) {
        console.error("[Cache API] Error caching context:", error);
        return NextResponse.json(
            { error: "Failed to cache dashboard context" },
            { status: 500 },
        );
    }
}

/**
 * GET /api/cache-context
 * Get cache statistics
 * 
 * @returns Cache stats: active sessions, memory usage, TTL configuration
 */
export async function GET() {
    const { getCacheStats } = await import("@/lib/cache-service");
    const stats = getCacheStats();

    return NextResponse.json({
        ...stats,
        ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || "15", 10),
    });
}
