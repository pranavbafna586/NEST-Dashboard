import { NextResponse } from "next/server";
import { deleteCachedContext, clearCache } from "@/lib/cache-service";

/**
 * POST /api/refresh-cache
 * Force refresh of cached dashboard context
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, clearAll } = body;

        if (clearAll === true) {
            // Clear entire cache (admin function)
            clearCache();
            return NextResponse.json({
                success: true,
                message: "All cache entries cleared",
            });
        }

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
