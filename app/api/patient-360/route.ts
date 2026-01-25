import { NextRequest, NextResponse } from "next/server";
import { getPatient360Data } from "@/database/queries/patient-360";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get("subjectId");
    const study = searchParams.get("study") || undefined;

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 },
      );
    }

    const data = getPatient360Data(subjectId, study);

    if (!data) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in patient-360 API:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient 360 data" },
      { status: 500 },
    );
  }
}
