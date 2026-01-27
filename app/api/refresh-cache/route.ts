/**
 * Cache Refresh API Endpoint
 * 
 * PURPOSE:
 * Manually forces refresh of cached dashboard context, either for specific session or all sessions.
 * Useful when dashboard data changes and user wants fresh AI chat context.
 * 
 * BUSINESS CONTEXT - When to Refresh Cache:
 * Cache becomes stale when:
 * - User changes filters (study, region, country, site selection)
 * - New data imported into database
 * - User wants to ensure AI sees latest dashboard state
 * - Session has been idle for extended period
 * 
 * REFRESH STRATEGIES:
 * 1. **Single Session Refresh** (clearAll=false, sessionId provided):
 *    - User clicked "Refresh" in chat widget
 *    - Clears only their cached context
 *    - Dashboard will auto-cache fresh data on next load
 * 
 * 2. **Global Cache Clear** (clearAll=true):
 *    - Admin/maintenance operation
 *    - Clears ALL cached sessions
 *    - Use after database updates affecting all users
 *    - CAUTION: Breaks active chat sessions for all users
 * 
 * WORKFLOW:
 * User flow when cache is stale:
 * 1. User notices AI chat answers are outdated or change filters
 * 2. Clicks "Refresh Data" button in chat UI
 * 3. Frontend calls /api/refresh-cache with their sessionId
 * 4. Cache cleared for that session
 * 5. Frontend automatically calls /api/cache-context with fresh data
 * 6. Chat resumes with updated context
 * 
 * ADMIN FLOW:
 * When database updated with new study data:
 * 1. Admin calls /api/refresh-cache with clearAll=true
 * 2. All cached contexts deleted
 * 3. Users see "Please reload dashboard" message in chat
 * 4. Users refresh browser, dashboard re-caches fresh data
 * 
 * SAFETY CONSIDERATIONS:
 * - clearAll=true is dangerous: use sparingly
 * - No authentication check currently (add in production!)
 * - Consider rate limiting to prevent cache thrashing
 * 
 * USE IN DASHBOARD:
 * - "Refresh Chat Data" button in chat widget (session-specific)
 * - Admin panel "Clear All Cache" button (global, authenticated)
 */

import { NextResponse } from "next/server";
import { deleteCachedContext, clearCache } from "@/lib/cache-service";

/**
 * POST /api/refresh-cache
 * Force refresh of cached dashboard context
 * 
 * @param request - HTTP request with body:
 *   - sessionId: (optional) Clear specific session cache
 *   - clearAll: (optional) If true, clear ALL cache entries
 * 
 * @returns Success message indicating what was cleared
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, clearAll } = body;

        // Global cache clear (admin function)
        if (clearAll === true) {
            clearCache();
            return NextResponse.json({
                success: true,
                message: "All cache entries cleared",
            });
        }

        // Single session cache clear
        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 },
            );
        }

        // Delete specific session cache
        deleteCachedContext(sessionId);

        return NextResponse.json({
            success: true,
            sessionId,
            message: "Cache refreshed. Please reload dashboard data.",
        });
    } catch (error) {
        console.error("[Refresh Cache API] Error:", error);
        return NextResponse.json(
            { error: "Failed to refresh cache" },
            { status: 500 },
        );
    }
}

/**
 * GET /api/refresh-cache
 * Get refresh instructions
 * 
 * @returns API usage instructions
 */
export async function GET() {
    return NextResponse.json({
        message: "Use POST to refresh cache",
        body: {
            sessionId: "string (required to clear specific session)",
            clearAll: "boolean (true to clear all sessions - use with caution)",
        },
    });
}
