import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { DashboardContext } from "@/types/dashboard-context";
import { buildSystemPrompt } from "@/lib/prompts";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Get the model configuration
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Generate an AI-powered insight based on user query and dashboard context
 * @param userMessage - The user's question or request
 * @param context - Current dashboard data context
 * @returns AI-generated response
 */
export async function generateInsight(
  userMessage: string,
  context: DashboardContext,
): Promise<string> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7, // Balance between creativity and accuracy
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048, // Increased for comprehensive responses with detailed data
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Build the system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error: any) {
    console.error("Error generating insight with Gemini:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
    });

    // Handle specific error cases
    if (error.message?.includes("API key") || error.status === 400) {
      throw new Error("Invalid API key. Please check your configuration.");
    } else if (error.message?.includes("quota") || error.status === 429) {
      throw new Error(
        "API quota exceeded. Please try again later or upgrade your plan.",
      );
    } else if (error.message?.includes("safety")) {
      throw new Error(
        "Your request was blocked by safety filters. Please rephrase your question.",
      );
    } else if (
      error.message?.includes("model") ||
      error.message?.includes("not found")
    ) {
      throw new Error(
        `Model error: ${error.message}. Please check your GEMINI_MODEL configuration.`,
      );
    }

    // Generic error with actual message
    throw new Error(
      error.message ||
        "I'm having trouble generating insights right now. Please try again in a moment.",
    );
  }
}

/**
 * Check if Gemini API is configured and accessible
 */
export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    return !!result.response.text();
  } catch (error) {
    console.error("Gemini connection check failed:", error);
    return false;
  }
}
