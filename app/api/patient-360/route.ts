/**
 * Patient 360 API Endpoint
 * 
 * PURPOSE:
 * Provides comprehensive "360° view" of a single subject (patient), aggregating ALL data points
 * across all forms, visits, and modules for complete patient profile visualization.
 * 
 * BUSINESS CONTEXT - Patient 360° View:
 * The Patient 360° view is the "master record" showing everything known about one subject:
 * - Demographics and baseline characteristics
 * - Complete visit history with dates and outcomes
 * - All data entry forms (CRFs) with completion status
 * - Query details (what data questions are open/closed)
 * - Protocol deviations specific to this subject
 * - SAEs (Serious Adverse Events) if any
 * - EDRR issues (external data reconciliation problems)
 * - Signature compliance for this subject's forms
 * - SDV status (source data verification progress)
 * 
 * WHY PATIENT 360° IS CRITICAL:
 * 
 * 1. **Investigation & Root Cause Analysis**:
 *    - When query rate is high: "What's wrong with this subject's data?"
 *    - When SAE occurs: "What is this subject's complete medical history?"
 *    - When deviation found: "Does this subject have other compliance issues?"
 * 
 * 2. **Safety Monitoring**:
 *    - Medical monitors review complete subject profile during SAE assessment
 *    - Identify patterns that may indicate drug safety signals
 *    - Evaluate subject appropriateness for continued trial participation
 * 
 * 3. **Regulatory Inspections**:
 *    - Auditors request complete subject records
 *    - Must demonstrate data traceability and integrity
 *    - Show all modifications, queries, and signatures for single subject
 * 
 * 4. **Database Lock Verification**:
 *    - Check that each subject has complete, clean, signed data
 *    - Verify all required assessments completed
 *    - Ensure all queries closed before final analysis
 * 
 * TYPICAL PATIENT 360° COMPONENTS:
 * - Subject Demographics: Age, gender, enrollment date, randomization info
 * - Visit Timeline: All protocol visits with status (completed/missed)
 * - Form Completion Matrix: Which CRF pages are complete, signed, locked
 * - Query Log: All data questions raised and resolved for this subject
 * - Deviation Log: Protocol violations involving this subject
 * - SAE Summary: Any serious adverse events with outcomes
 * - Lab Data: Central lab results and ranges
 * - Vitals Trends: Blood pressure, heart rate, temperature over time
 * - Medication History: Concomitant meds and study drug administration
 * 
 * REQUIRED PARAMETER:
 * - subjectId is MANDATORY - this endpoint is for single-subject view
 * - Returns 404 if subject not found
 * - Study parameter optional but recommended for performance
 * 
 * DATA SOURCE:
 * - Delegates to getPatient360Data query module
 * - Aggregates from ALL tables: subject_level_metrics, query_report, sae_issues,
 *   protocol_deviation, pi_signature_report, sdv, edrr_issues
 * - Excel Source: Multiple sheets across all Excel files combined
 * 
 * USE IN DASHBOARD:
 * Powers the "Patient 360" detail page showing complete subject record in tabbed interface.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPatient360Data } from "@/database/queries/patient-360";

/**
 * GET /api/patient-360
 * 
 * Retrieves comprehensive 360° view data for a single subject.
 * 
 * @param request - HTTP request with REQUIRED query parameter:
 *   - subjectId: (REQUIRED) Subject ID to retrieve data for
 *   - study: (Optional) Study filter for performance optimization
 * 
 * @returns JSON response with complete subject profile including:
 *   - demographics, visits, forms, queries, deviations, SAEs, signatures, SDV status
 * 
 * @throws 400 if subjectId not provided
 * @throws 404 if subject not found in database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get("subjectId");
    const study = searchParams.get("study") || undefined;

    // Validate required parameter
    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 },
      );
    }

    // Fetch comprehensive patient 360 data
    const data = getPatient360Data(subjectId, study);

    // Return 404 if subject not found
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
