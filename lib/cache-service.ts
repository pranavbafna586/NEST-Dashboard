import { DashboardContext } from "@/types/dashboard-context";

interface CacheEntry {
    context: DashboardContext;
    expiresAt: Date;
    createdAt: Date;
}

// In-memory cache (for development - use Redis in production)
const cache = new Map<string, CacheEntry>();

// Configuration
const CACHE_TTL_MINUTES =
    parseInt(process.env.CACHE_TTL_MINUTES || "15", 10) || 15;
const MAX_CACHE_SIZE = 1000; // Maximum number of sessions to cache

/**
 * Store dashboard context in cache
 * @param sessionId - Unique session identifier
 * @param context - Dashboard context to cache
 */
export function setCachedContext(
    sessionId: string,
    context: DashboardContext,
): void {
    // Clean up expired entries if cache is getting large
    if (cache.size > MAX_CACHE_SIZE) {
        cleanupExpiredEntries();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000);

    cache.set(sessionId, {
        context,
        expiresAt,
        createdAt: now,
    });

    console.log(
        `[Cache] Stored context for session ${sessionId.substring(0, 8)}... (expires in ${CACHE_TTL_MINUTES}min)`,
    );
}

/**
 * Retrieve dashboard context from cache
 * @param sessionId - Unique session identifier
 * @returns Cached context or null if not found/expired
 */
export function getCachedContext(
    sessionId: string,
): DashboardContext | null {
    const entry = cache.get(sessionId);

    if (!entry) {
        console.log(
            `[Cache] No context found for session ${sessionId.substring(0, 8)}...`,
        );
        return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
        console.log(
            `[Cache] Context expired for session ${sessionId.substring(0, 8)}...`,
        );
        cache.delete(sessionId);
        return null;
    }

    console.log(
        `[Cache] Retrieved context for session ${sessionId.substring(0, 8)}...`,
    );
    return entry.context;
}

/**
 * Delete cached context for a session
 * @param sessionId - Unique session identifier
 */
export function deleteCachedContext(sessionId: string): void {
    cache.delete(sessionId);
    console.log(
        `[Cache] Deleted context for session ${sessionId.substring(0, 8)}...`,
    );
}

/**
 * Get cache age in minutes
 * @param sessionId - Unique session identifier
 * @returns Age in minutes or null if not found
 */
export function getCacheAge(sessionId: string): number | null {
    const entry = cache.get(sessionId);

    if (!entry) {
        return null;
    }

    const ageMs = Date.now() - entry.createdAt.getTime();
    return Math.floor(ageMs / (1000 * 60));
}

/**
 * Check if cache is expired
 * @param sessionId - Unique session identifier
 * @returns true if expired or not found
 */
export function isCacheExpired(sessionId: string): boolean {
    const entry = cache.get(sessionId);

    if (!entry) {
        return true;
    }

    return new Date() > entry.expiresAt;
}

/**
 * Clean up all expired cache entries
 */
export function cleanupExpiredEntries(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, entry] of cache.entries()) {
        if (now > entry.expiresAt) {
            cache.delete(sessionId);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[Cache] Cleaned up ${cleanedCount} expired entries`);
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
} {
    const now = new Date();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const entry of cache.values()) {
        if (now > entry.expiresAt) {
            expiredEntries++;
        } else {
            activeEntries++;
        }
    }

    return {
        totalEntries: cache.size,
        activeEntries,
        expiredEntries,
    };
}

/**
 * Clear entire cache (useful for testing)
 */
export function clearCache(): void {
    cache.clear();
    console.log("[Cache] Cleared all entries");
}

// Auto-cleanup every 5 minutes
setInterval(() => {
    cleanupExpiredEntries();
}, 5 * 60 * 1000);
