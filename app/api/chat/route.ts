import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/gemini";
import { getCachedContext, getCacheAge } from "@/lib/cache-service";
import {
  ChatRequest,
  ChatResponse,
  DashboardContext,
} from "@/types/dashboard-context";

// Rate limiting map (in-memory - use Redis in production)
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

    // Get context from cache or use provided context
    let dashboardContext: DashboardContext | null = context || null;
    if (!dashboardContext) {
      dashboardContext = getCachedContext(sessionId);
    }

    if (!dashboardContext) {
      return NextResponse.json(
        {
          error:
            "No dashboard data available. Please refresh the dashboard and try again.",
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

    // Generate AI response
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

    // Handle Gemini-specific errors
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
