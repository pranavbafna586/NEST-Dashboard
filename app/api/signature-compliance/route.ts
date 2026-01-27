/**
 * PI Signature Compliance API Endpoint
 * 
 * PURPOSE:
 * Tracks compliance with Principal Investigator (PI) signature requirements for Clinical
 * Research Forms (CRFs). Monitors signature timing, identifies overdue forms, and flags
 * broken electronic signatures that need re-signing.
 * 
 * BUSINESS CONTEXT - Why PI Signatures Matter:
 * In clinical trials, the Principal Investigator (lead doctor at each site) must electronically
 * sign data entry forms to certify their accuracy. This is a regulatory requirement enforced
 * by Good Clinical Practice (GCP) guidelines.
 * 
 * PI signature confirms:
 * - "I have reviewed this data"
 * - "This data accurately reflects the source documents"
 * - "I take responsibility for the accuracy of this information"
 * 
 * Without PI signatures, data is legally invalid for regulatory submissions.
 * 
 * SIGNATURE SLA (Service Level Agreement) THRESHOLDS:
 * Forms should be signed within specific timeframes after data entry:
 * 
 * 1. **Within 45 Days**: ✅ Green - Acceptable
 *    - Normal signing cadence
 *    - Compliant with most study protocols
 * 
 * 2. **45-90 Days**: ⚠️ Yellow - Warning
 *    - Approaching non-compliance
 *    - Site coordinator should remind PI
 * 
 * 3. **Beyond 90 Days**: 🔴 Red - Critical Non-Compliance
 *    - Major protocol deviation
 *    - Triggers regulatory findings in audits
 *    - May require corrective action plan (CAPA)
 * 
 * 4. **Never Signed**: 🔴🔴 Critical - Urgent Action Required
 *    - Data is invalid until signed
 *    - Cannot be included in analysis or submission
 * 
 * 5. **Broken Signatures**: 🛠️ Technical Issue
 *    - Electronic signature became invalid (system upgrade, security change)
 *    - Requires PI to re-sign the form
 *    - Common after EDC system migrations or updates
 * 
 * SIGNATURE STATUS CATEGORIES:
 * - **CRFs Signed**: Forms with valid PI signature
 * - **CRFs Overdue (within 45 days)**: Recently entered, approaching deadline
 * - **CRFs Overdue (45-90 days)**: Warning threshold exceeded
 * - **CRFs Overdue (beyond 90 days)**: Critical non-compliance
 * - **Broken Signatures**: Valid signatures that became invalid due to system issues
 * - **CRFs Never Signed**: Forms that were supposed to be signed but never were
 * 
 * REGULATORY COMPLIANCE:
 * - FDA 21 CFR Part 11: Electronic signatures must be verifiable and secure
 * - ICH-GCP E6(R2): Investigator must ensure accuracy of data
 * - Unsigned or late-signed data raises data integrity questions
 * - Pattern of signature non-compliance can trigger regulatory action
 * 
 * DUAL RESPONSE MODE:
 * This endpoint supports two query modes:
 * 
 * 1. **Detailed Breakdown** (summary=false or omitted):
 *    Returns site-by-site, subject-by-subject signature statistics
 *    Use for: Drilling down to identify specific forms needing signatures
 * 
 * 2. **Summary Statistics** (summary=true):
 *    Returns aggregate counts across all signature categories
 *    Use for: High-level KPI cards showing overall signature compliance
 * 
 * DATA SOURCE:
 * - Primary Table: pi_signature_report
 * - Columns: project_name, site_id, subject_id, form_name, page_require_signature,
 *            no_of_days, visit_date, date_page_entered
 * - Excel Source: CPID_EDC_Metrics.xlsx > PI Signature Report sheet
 * - Calculation: no_of_days = current_date - date_page_entered
 * 
 * USE IN DASHBOARD:
 * Powers signature compliance visualizations including:
 * - Signature status distribution pie chart
 * - Site-wise compliance heat map
 * - Aging histogram of unsigned forms
 * - KPI cards showing % compliance and overdue counts
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSignatureComplianceData,
  getSignatureComplianceSummary,
} from "@/database/queries/signature-compliance";

/**
 * GET /api/signature-compliance
 * Returns signature compliance data with optional filters
 *
 * Query Parameters:
 * - study: Project/study name filter
 * - region: Region filter
 * - country: Country filter
 * - siteId: Site ID filter
 * - subjectId: Subject ID filter
 * - summary: If "true", returns summary statistics instead of detailed breakdown
 */
export async function GET(request: NextRequest) {
  try {
    // Extract all filter parameters from query string including summary mode flag
    const searchParams = request.nextUrl.searchParams;

    const study = searchParams.get("study") || undefined;
    const region = searchParams.get("region") || undefined;
    const country = searchParams.get("country") || undefined;
    const siteId = searchParams.get("siteId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const summary = searchParams.get("summary") === "true";

    /**
     * DUAL RESPONSE MODE:
     * Summary mode (summary=true) returns aggregate statistics for KPI cards.
     * Detailed mode (default) returns individual signature records for drill-down analysis.
     */
    if (summary) {
      /**
       * SUMMARY MODE:
       * Returns aggregate counts across all signature status categories:
       * - total_crfs_signed
       * - overdue_within_45_days
       * - overdue_45_to_90_days
       * - overdue_beyond_90_days
       * - broken_signatures
       * - never_signed
       * 
       * Used for dashboard KPI cards showing overall signature compliance health.
       */
      const summaryData = getSignatureComplianceSummary(
        study,
        region,
        country,
        siteId,
        subjectId,
      );
      return NextResponse.json({
        summary: summaryData,
        filters: {
          study: study || "ALL",
          region: region || "ALL",
          country: country || "ALL",
          siteId: siteId || "ALL",
          subjectId: subjectId || "ALL",
        },
      });
    }

    /**
     * DETAILED MODE:
     * Returns individual signature records grouped by site/subject.
     * Allows drill-down to identify specific forms needing PI attention.
     * Each record includes form name, visit date, signature status, and days pending.
     */
    const data = getSignatureComplianceData(
      study,
      region,
      country,
      siteId,
      subjectId,
    );

    return NextResponse.json({
      data,
      filters: {
        study: study || "ALL",
        region: region || "ALL",
        country: country || "ALL",
        siteId: siteId || "ALL",
        subjectId: subjectId || "ALL",
      },
    });
  } catch (error) {
    console.error("Error in signature compliance API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch signature compliance data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
