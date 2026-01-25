import { NextResponse } from "next/server";
import { getUniqueCountries } from "@/database/queries/sidebar-filters";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || undefined;

    const countries = getUniqueCountries(region);
    return NextResponse.json({ countries });
  } catch (error) {
    console.error("Error in /api/countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 },
    );
  }
}
