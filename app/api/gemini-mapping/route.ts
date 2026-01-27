/**
 * Gemini AI File Mapping API Endpoint
 * 
 * PURPOSE:
 * Uses Gemini AI to intelligently map uploaded Excel files to expected database tables
 * by analyzing file names, sheet names, and column structures. Enables automated 
 * data ingestion from variably-named Excel files.
 * 
 * BUSINESS CONTEXT - File Upload Challenge:
 * Clinical trial data arrives from multiple sources with inconsistent naming:
 * - Different studies use different file naming conventions
 * - Some studies have "Study 1_SAE_Report.xlsx", others just "SAE_issues.xlsx"
 * - Sites may export data with custom names or timestamps
 * - Manual file-to-table mapping is error-prone and time-consuming
 * 
 * AI-POWERED SOLUTION:
 * Gemini analyzes the uploaded file structures and intelligently determines:
 * - Which Excel file corresponds to which database table
 * - Whether required files are missing
 * - If file structures match expected schemas
 * - Suggested corrections for misnamed files
 * 
 * WORKFLOW:
 * 1. User uploads multiple Excel files via /api/save-files
 * 2. Frontend reads file names and Excel sheet structure  
 * 3. /api/gemini-mapping receives file metadata + expected schema
 * 4. Gemini AI analyzes and returns mapping: filename → table_name
 * 5. User reviews and confirms mapping
 * 6. /api/import-to-database uses mapping to ingest data
 * 
 * GEMINI CONFIGURATION:
 * - Model: gemini-2.0-flash-exp (optimized for structured data understanding)
 * - Temperature: 0.1 (low for deterministic, consistent mappings)
 * - Output: Structured JSON with fileMappings array
 * 
 * EXPECTED OUTPUT FORMAT:
 * ```json
 * {
 *   "success": true,
 *   "fileMappings": [
 *     { "filename": "Study 1_SAE_Report.xlsx", "table": "sae_issues", "confidence": 0.95 },
 *     { "filename": "Query_Report.xlsx", "table": "query_report", "confidence": 0.90 }
 *   ],
 *   "summary": "Successfully mapped 8 of 9 files. 1 file unrecognized.",
 *   "errors": ["Could not map Extra_Data_123.xlsx to any known table"]
 * }
 * ```
 * 
 * ERROR HANDLING:
 * - Gemini may return markdown-wrapped JSON (```json...```) - cleaned automatically
 * - Parse errors: Return safe fallback with raw Gemini response for debugging
 * - API errors: Return structured error to frontend for user feedback
 * 
 * USE IN DASHBOARD:
 * Powers the "Upload Study Data" wizard where users drag-and-drop Excel files
 * and get instant AI-powered file recognition and mapping suggestions.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * POST /api/gemini-mapping
 * 
 * Analyzes uploaded file structures and returns intelligent file-to-table mappings.
 * 
 * @param request - HTTP request with body:
 *   - prompt: Structured prompt with file metadata and expected schema
 *   - uploadedStructures: File names, sheet names, column lists
 * 
 * @returns JSON response with file mappings, confidence scores, and any errors
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, uploadedStructures } = await request.json();

    // Validate required input
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Use latest Gemini model for structured data understanding
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Call Gemini API with optimized generation config
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent, deterministic output
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const text = response.text();

    /**
     * JSON PARSING WITH MARKDOWN CLEANUP:
     * Gemini sometimes wraps JSON in markdown code blocks like:
     * ```json
     * { "success": true, ... }
     * ```
     * 
     * We strip these markers to get clean JSON.
     */
    let mappingResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      mappingResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        {
          success: false,
          fileMappings: [],
          summary: "Failed to parse Gemini response",
          errors: ["Invalid JSON response from Gemini"],
          rawResponse: text, // Include for debugging
        },
        { status: 500 },
      );
    }

    return NextResponse.json(mappingResponse);
  } catch (error) {
    console.error("Error in Gemini mapping API:", error);
    return NextResponse.json(
      {
        success: false,
        fileMappings: [],
        summary: "Error calling Gemini API",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 },
    );
  }
}
