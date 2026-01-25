import { NextRequest, NextResponse } from "next/server";
import {
  getRegionalDataEntryProgress,
  getCountryDataEntryProgress,
  getSiteDataEntryProgress,
} from "@/database/queries/regional-data-entry";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;

    // Determine which level of aggregation to return based on filters
    let data;
    let level;

    // If country is selected, show site-level breakdown
    if (country && country !== "ALL") {
      data = getSiteDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "site";
    }
    // If region is selected (but not country), show country-level breakdown
    else if (region && region !== "ALL") {
      data = getCountryDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "country";
    }
    // Otherwise, show region-level breakdown
    else {
      data = getRegionalDataEntryProgress(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      level = "region";
    }

    return NextResponse.json({
      data,
      level,
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in regional data entry API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch regional data entry progress",
        data: [],
        level: "region",
      },
      { status: 500 },
    );
  }
}
