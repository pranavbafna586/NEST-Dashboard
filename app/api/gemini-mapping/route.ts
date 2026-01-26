import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { prompt, uploadedStructures } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

    // Parse JSON response from Gemini
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
          rawResponse: text,
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
