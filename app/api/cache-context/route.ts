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
 */
export async function POST(request: Request) {
    try {
        const body: DashboardContext = await request.json();

        // Validate the context
        if (!validateDashboardContext(body)) {
            return NextResponse.json(
                { error: "Invalid dashboard context" },
                { status: 400 },
            );
        }

        // Cache the context
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
 */
export async function GET() {
    const { getCacheStats } = await import("@/lib/cache-service");
    const stats = getCacheStats();

    return NextResponse.json({
        ...stats,
        ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || "15", 10),
    });
}
