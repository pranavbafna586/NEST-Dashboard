/**
 * AI Chat API Endpoint - Gemini-Powered Dashboard Insights
 * 
 * PURPOSE:
 * Enables natural language conversations with dashboard data using Google's Gemini AI.
 * Users can ask questions about their clinical trial data and receive contextualized insights
 * based on their current dashboard state (filtered data, study selection, etc.).
 * 
 * BUSINESS CONTEXT - AI-Powered Data Analysis:
 * Clinical trial dashboards contain complex, multidimensional data that requires expertise
 * to interpret. This AI copilot helps users:
 * - Ask questions in plain English without needing SQL or data science skills
 * - Get instant insights about trends, outliers, and patterns
 * - Understand what the numbers mean in business context
 * - Discover hidden correlations across datasets
 * - Generate executive summaries of dashboard state
 * 
 * EXAMPLE USER QUESTIONS:
 * - "Which sites have the most protocol deviations?"
 * - "Why is Site 101's query rate so high compared to others?"
 * - "Are there any concerning safety signals in the SAE data?"
 * - "Which countries are lagging in enrollment?"
 * - "Is the study on track for database lock?"
 * - "Summarize the key risks in this filtered data"
 * 
 * HOW IT WORKS:
 * 1. Frontend aggregates ALL current dashboard data into DashboardContext
 * 2. Context cached on server with sessionId (15-minute TTL)
 * 3. User sends chat message referencing their session
 * 4. API retrieves cached context and sends it + user question to Gemini
 * 5. Gemini analyzes the data and generates natural language response
 * 6. Response returned to user with data quality indicators
 * 
 * CONTEXT CACHING STRATEGY:
 * - Reduces Gemini API costs: Context sent once, reused for 15 minutes
 * - Faster responses: No need to re-aggregate data on every message
 * - Session isolation: Each user has independent context and history
 * - Automatic cleanup: Stale contexts removed every 5 minutes
 * 
 * RATE LIMITING:
 * - 10 messages per minute per session (configurable via RATE_LIMIT_PER_MINUTE)
 * - Prevents abuse and controls API costs
 * - In-memory tracking (use Redis for production multi-server deployment)
 * 
 * SECURITY CONSIDERATIONS:
 * - Session IDs prevent cross-user data leakage
 * - Content safety filters prevent prompt injection
 * - API key secured in environment variables
 * - No PII sent to Gemini (only aggregated clinical trial metrics)
 * 
 * ERROR HANDLING:
 * - API key errors: Configuration issue, contact support
 * - Quota exceeded: Service temporarily unavailable, retry
 * - Safety filters: Content flagged, rephrase question
 * - Stale context: Dashboard refresh required
 * 
 * DATA SOURCES:
 * - Receives aggregated DashboardContext with data from ALL other API endpoints
 * - Gemini Model: gemini-1.5-flash (fast, cost-effective for dashboard Q&A)
 * 
 * USE IN DASHBOARD:
 * Powers the floating chat widget where users converse with their trial data.
 */

import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/gemini";
import { getCachedContext, getCacheAge } from "@/lib/cache-service";
import {
  ChatRequest,
  ChatResponse,
  DashboardContext,
} from "@/types/dashboard-context";

/**
 * RATE LIMITING:
 * In-memory map tracking message counts per session per minute.
 * Production deployments should use Redis for multi-server support.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>();

const RATE_LIMIT_PER_MINUTE =
  parseInt(process.env.RATE_LIMIT_PER_MINUTE || "10", 10) || 10;

/**
 * Check rate limit for a session
 * @param sessionId - Session identifier
 * @returns true if rate limit exceeded
 */
function checkRateLimit(sessionId: string): boolean {
  const now = new Date();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    // Reset or create new entry
    rateLimitMap.set(sessionId, {
      count: 1,
      resetAt: new Date(now.getTime() + 60 * 1000), // 1 minute from now
    });
    return false;
  }

  if (entry.count >= RATE_LIMIT_PER_MINUTE) {
    return true; // Rate limit exceeded
  }

  entry.count++;
  return false;
}

/**
 * POST /api/chat
 * Handle chatbot messages with Gemini AI
 */
export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId, context } = body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Check rate limit
    if (checkRateLimit(sessionId)) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a moment before sending another message.",
        },
        { status: 429 },
      );
    }

    /**
     * CONTEXT RETRIEVAL:
     * Try to use provided context first (rare), fall back to cached context.
     * Cached context is set by /api/cache-context when dashboard loads.
     * If no context found, user needs to reload dashboard to populate cache.
     */
    let dashboardContext: DashboardContext | null = context || null;
    if (!dashboardContext) {
      dashboardContext = getCachedContext(sessionId);
    }

    if (!dashboardContext) {
      console.log(`[Chat API] No cached context found for session ${sessionId}`);
      console.log(`[Chat API] Available sessions:`, Array.from(cache.keys ? [] : []));
      return NextResponse.json(
        {
          error:
            "Dashboard data is still loading. Please wait a moment for the dashboard to fully load, then try again.",
          requiresRefresh: true,
        },
        { status: 404 },
      );
    }

    // Log context details for debugging
    console.log(`[Chat API] Using context with data:`, {
      kpi: dashboardContext.data.kpi,
      regionalCount: dashboardContext.data.regional?.length || 0,
      countryCount: dashboardContext.data.countryPerformance?.length || 0,
      subjectPerformanceCount:
        dashboardContext.data.subjectPerformance?.length || 0,
      signatureComplianceCount:
        dashboardContext.data.signatureCompliance?.length || 0,
      subjectOverviewCount: dashboardContext.data.subjectOverview?.length || 0,
      sitePerformanceCount: dashboardContext.data.sitePerformance?.length || 0,
      hasPatient360: !!dashboardContext.data.patient360,
    });

    // Get cache age
    const cacheAge = getCacheAge(sessionId);

    console.log(
      `[Chat API] Processing message for session ${sessionId.substring(0, 8)}... Cache age: ${cacheAge}min`,
    );

    /**
     * GEMINI AI GENERATION:
     * Sends user question + dashboard context to Gemini for analysis.
     * See lib/gemini.ts for prompt engineering and context formatting.
     */
    const aiResponse = await generateInsight(message, dashboardContext);

    // Prepare response
    const response: ChatResponse = {
      message: aiResponse,
      timestamp: new Date().toISOString(),
      dataQuality: dashboardContext.metadata.dataQuality,
      cacheAge: cacheAge || 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[Chat API] Error:", error);

    /**
     * GEMINI ERROR CATEGORIZATION:
     * - API key errors: Configuration problem, support needed
     * - Quota errors: Too many requests, temporary service degradation
     * - Safety errors: Content filter triggered, user should rephrase
     */
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 500 },
      );
    } else if (error.message?.includes("quota")) {
      return NextResponse.json(
        {
          error:
            "AI service is temporarily unavailable due to high demand. Please try again in a few minutes.",
        },
        { status: 503 },
      );
    } else if (error.message?.includes("safety")) {
      return NextResponse.json(
        {
          error:
            "Your message was flagged by our content filters. Please rephrase your question.",
        },
        { status: 400 },
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error:
          "I'm having trouble generating insights right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chat
 * Get chat service status
 */
export async function GET() {
  return NextResponse.json({
    status: "operational",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    rateLimit: `${RATE_LIMIT_PER_MINUTE} requests per minute`,
  });
}
