/**
 * Complete expected structure for Study Excel files
 * Auto-generated from "Study 1" folder
 * Contains ALL columns including multi-row headers merged with " - " separator
 *
 * Multi-row headers are merged like:
 * Row 0: "CPMD", Row 1: "Visit status", Row 2: "# Expected Visits"
 * Result: "CPMD - Visit status - # Expected Visits"
 */

export interface ExpectedFileStructure {
  expectedFileName: string;
  description?: string;
  sheets?: {
    sheetName: string;
    requiredColumns: string[];
  }[];
}

export const EXPECTED_FILES: ExpectedFileStructure[] = [
  {
    expectedFileName: "CPID_EDC_Metrics.xlsx",
    sheets: [
      {
        sheetName: "Subject Level Metrics",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject ID",
          "Latest Visit (SV) (Source: Rave EDC: BO4)",
          "Subject Status (Source: PRIMARY Form)",
          "Input files - Missing Visits",
          "Input files - Missing Page",
          "Input files - # Coded terms",
          "Input files - # Uncoded Terms",
          "Input files - # Open issues in LNR",
          "Input files - # Open Issues reported for 3rd party reconciliation in EDRR",
          "Input files - Inactivated forms and folders",
          "Input files - # eSAE dashboard review for DM",
          "Input files - # eSAE dashboard review for safety",
          "CPMD - Visit status - # Expected Visits (Rave EDC : BO4)",
          "CPMD - Page status (Source: (Rave EDC : BO4)) - # Pages Entered",
          "CPMD - Page status (Source: (Rave EDC : BO4)) - # Pages with Non-Conformant data",
          "CPMD - Page status (Source: (Rave EDC : BO4)) - # Total CRFs with queries & Non-Conformant data",
          "CPMD - Page status (Source: (Rave EDC : BO4)) - # Total CRFs without queries & Non-Conformant data",
          "CPMD - Page status (Source: (Rave EDC : BO4)) - % Clean Entered CRF",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # DM Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Clinical Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Medical Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Site Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Field Monitor Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Coding Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - # Safety Queries",
          "CPMD - Queries status (Source:(Rave EDC : BO4)) - #Total Queries",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Require Verification (SDV)",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # Forms Verified",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Frozen",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Not Frozen",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Locked",
          "CPMD - Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Unlocked",
          "CPMD - Protocol Deviations (Source:(Rave EDC : BO4)) - # PDs Confirmed",
          "CPMD - Protocol Deviations (Source:(Rave EDC : BO4)) - # PDs Proposed",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - # CRFs Signed",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - CRFs overdue for signs within 45 days of Data entry",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - CRFs overdue for signs between 45 to 90 days of Data entry",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - CRFs overdue for signs beyond 90 days of Data entry",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - Broken Signatures",
          "SSM - PI Signatures (Source: (Rave EDC : BO4)) - CRFs Never Signed",
        ],
      },
      {
        sheetName: "Region_Country View",
        requiredColumns: [
          "Project Name - Responsible LF for action",
          "Region",
          "Country",
          "Site ID",
          "Subject ID",
          "Visit Status (Source: J-review) - # Missing Visits - Site/CRA",
          "Page Status (Source: (Rave EDC : BO4)) - # Missing Pages - Site/CRA",
          "Queries status (Source:(Rave EDC : BO4)) - # Site Queries - Site/CRA",
          "Queries status (Source:(Rave EDC : BO4)) - # Field Monitor Queries - CRA",
          "PI Signatures (Source: (Rave EDC : BO4)) - Broken Signatures - Investigator",
          "PI Signatures (Source: (Rave EDC : BO4)) - CRFs Never Signed",
          "Page Action Status (Source: (Rave EDC : BO4)) - # CRFs Require Verification (SDV) - CRA",
          "Page Action Status (Source: (Rave EDC : BO4)) - # Pages with Non-Conformant data - Site/CRA",
          "Page Action Status (Source: (Rave EDC : BO4)) - Inactivated forms and folders - Site/CRA",
          "Missing LNRs (Source: (J-review)) - # Missing Lab Ranges/Units in Lab Module - CRA",
          "Missing LNRs (Source: (J-review)) - # Missing Lab name  on CRFs - Site",
        ],
      },
      {
        sheetName: "Query Report - Cumulative",
        requiredColumns: [
          "Study",
          "Region",
          "Country",
          "Site Number",
          "Subject Name",
          "Folder Name",
          "Form",
          "Field OID",
          "Log #",
          "Visit Date",
          "Query Status",
          "Action Owner",
          "Marking Group Name",
          "Query Open Date",
          "Query Response Date",
          "# Days Since Open",
          "# Days Since Response",
        ],
      },
      {
        sheetName: "Query Report - Site Action",
        requiredColumns: [
          "Study",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Folder Name",
          "Form",
          "Field OID",
          "Log #",
          "Visit Date",
          "Query Status",
          "Action Owner",
          "Marking Group Name",
          "Query Open Date",
          "Query Response Date",
          "# Days Since Open",
          "# Days Since Response",
        ],
      },
      {
        sheetName: "Query Report - CRA Action",
        requiredColumns: [
          "Study",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Folder Name",
          "Form",
          "Field OID",
          "Log #",
          "Visit Date",
          "Query Status",
          "Action Owner",
          "Marking Group Name",
          "Query Open Date",
          "Query Response Date",
          "# Days Since Open",
          "# Days Since Response",
        ],
      },
      {
        sheetName: "Non conformant",
        requiredColumns: [
          "Study",
          "Region",
          "Country",
          "Study Site",
          "Subject Name",
          "Folder Name",
          "Page",
          "Log #",
          "Field OID",
          "Audit Time",
          "Visit date",
        ],
      },
      {
        sheetName: "PI Signature Report",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Visit Name",
          "Data Page Name",
          "Page Require Signature",
          "Audit Action",
          "Visit Date",
          "Date page entered/ Date last PI Sign",
          "No. of days",
          "Pending since/ PI signed since",
        ],
      },
      {
        sheetName: "SDV",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site",
          "Subject Name",
          "Folder Name",
          "Data Page Name",
          "Visit Date",
          "Verification Status",
        ],
      },
      {
        sheetName: "Protocol Deviation",
        requiredColumns: [
          "Study",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Folder Name",
          "Data Page Name",
          "Log #",
          "PD Status",
          "Visit date",
        ],
      },
      {
        sheetName: "CRF Freeze",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Data Page Name",
          "Freeze",
          "Visit date",
        ],
      },
      {
        sheetName: "CRF UnFreeze",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Data Page Name",
          "UnFreeze",
          "Visit date",
        ],
      },
      {
        sheetName: "CRF Locked",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Data Page Name",
          "Lock and Unlock",
          "Audit User",
          "Visit date",
        ],
      },
      {
        sheetName: "CRF UnLocked",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Data Page Name",
          "Lock and Unlock",
          "Audit User",
          "Visit date",
        ],
      },
      {
        sheetName: "SV",
        requiredColumns: [
          "Project Name",
          "Region",
          "Country",
          "Site ID",
          "Subject Name",
          "Folder Name",
          "Visit date",
        ],
      },
      {
        sheetName: "Reports info -reference",
        requiredColumns: ["Report Name", "Content"],
      },
    ],
  },
  {
    expectedFileName: "Compiled_EDRR.xlsx",
    sheets: [
      {
        sheetName: "OpenIssuesSummary",
        requiredColumns: [
          "Study",
          "Subject",
          "Total Open issue Count per subject",
          ".",
        ],
      },
    ],
  },
  {
    expectedFileName: "GlobalCodingReport_MedDRA.xlsx",
    sheets: [
      {
        sheetName: "GlobalCodingReport_MedDRA",
        requiredColumns: [
          "MedDRA Coding Report",
          "Study",
          "Dictionary",
          "Dictionary Version number",
          "Subject",
          "Form OID",
          "Logline",
          "Field OID",
          "Coding Status",
          "Require Coding",
        ],
      },
    ],
  },
  {
    expectedFileName: "GlobalCodingReport_WHODD.xlsx",
    sheets: [
      {
        sheetName: "GlobalCodingReport_WHODD",
        requiredColumns: [
          "WHODrug Coding Report",
          "Study",
          "Dictionary",
          "Dictionary Version number",
          "Subject",
          "Form OID",
          "Logline",
          "Field OID",
          "Coding Status",
          "Require Coding",
        ],
      },
    ],
  },
  {
    expectedFileName: "Inactivated_Forms_Folders_Records_Report.xlsx",
    sheets: [
      {
        sheetName: "Sheet1",
        requiredColumns: [
          "Country",
          "Study Site Number",
          "Subject",
          "Folder",
          "Form",
          "Data on Form/\r\nRecord",
          "RecordPosition",
          "Audit Action",
        ],
      },
    ],
  },
  {
    expectedFileName: "Missing_Lab_Name_and_Missing_Ranges.xlsx",
    sheets: [
      {
        sheetName: "Missing_Lab_Name_and_Missing",
        requiredColumns: [
          "Country",
          "Site number",
          "Subject",
          "Visit",
          "Form Name",
          "Lab category",
          "Lab Date",
          "Test Name",
          "Test description",
          "Issue",
        ],
      },
    ],
  },
  {
    expectedFileName: "Missing_Pages_Report.xlsx",
    sheets: [
      {
        sheetName: "All Pages Missing",
        requiredColumns: [
          "Form Details",
          "Country",
          "Site Number",
          "Subject Name",
          "Visit Name",
          "Page Name",
          "Visit date",
          "Subject Status",
          "# of Days Missing",
        ],
      },
      {
        sheetName: "Visit Level Pages Missing",
        requiredColumns: [
          "Form Details",
          "Country",
          "Site Number",
          "Subject Name",
          "Visit Name",
          "Page Name",
          "Visit date",
          "Subject Status",
          "# of Days Missing",
        ],
      },
    ],
  },
  {
    expectedFileName: "Visit_Projection_Tracker.xlsx",
    sheets: [
      {
        sheetName: "Missing Visits",
        requiredColumns: [
          "Country",
          "Site",
          "Subject",
          "Visit",
          "Projected Date",
          "# Days Outstanding",
        ],
      },
    ],
  },
  {
    expectedFileName: "eSAE_Dashboard_Standard_DM_Safety_Report.xlsx",
    sheets: [
      {
        sheetName: "SAE Dashboard_DM",
        requiredColumns: [
          "Discrepancy ID",
          "Study ID",
          "Country",
          "Site",
          "Patient ID",
          "Form Name",
          "Discrepancy Created Timestamp in Dashboard",
          "Review Status",
          "Action Status",
        ],
      },
      {
        sheetName: "SAE Dashboard_Safety",
        requiredColumns: [
          "Discrepancy ID",
          "Study ID",
          "Site",
          "Patient ID",
          "Case Status",
          "Discrepancy Created Timestamp in Dashboard",
          "Review Status",
          "Action Status",
        ],
      },
    ],
  },
];

/**
 * Helper function to find expected file by name (case-insensitive, ignores common prefixes/suffixes)
 */
export function findExpectedFile(
  fileName: string,
): ExpectedFileStructure | undefined {
  let normalized = fileName.toLowerCase();

  // Remove common prefixes and suffixes step by step
  normalized = normalized.replace("study 1_", "");
  normalized = normalized.replace("_updated", "");
  normalized = normalized.replace(/_ursv?\d+\.?\d*/g, "");
  normalized = normalized.replace(
    /_\d+\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/g,
    "",
  );
  normalized = normalized.trim();

  return EXPECTED_FILES.find((f) => {
    const expectedLower = f.expectedFileName.toLowerCase();
    return (
      expectedLower === normalized ||
      expectedLower.includes(normalized) ||
      normalized.includes(expectedLower)
    );
  });
}

/**
 * Helper function to get all expected column names for a specific sheet
 */
export function getExpectedColumns(
  fileName: string,
  sheetName: string,
): string[] {
  const file = findExpectedFile(fileName);
  if (!file || !file.sheets) return [];

  const sheet = file.sheets.find((s) => s.sheetName === sheetName);
  return sheet?.requiredColumns || [];
}

/**
 * Total statistics
 */
export const STRUCTURE_STATS = {
  totalFiles: 9,
  totalSheets: 25,
  totalColumns: 280,
};

/**
 * Generate human-readable text description of expected structure for Gemini prompt
 */
export function generateExpectedStructureText(): string {
  let text = "📋 EXPECTED STRUCTURE (All 9 Required Files):\n\n";

  EXPECTED_FILES.forEach((file, fileIdx) => {
    text += `${fileIdx + 1}. ${file.expectedFileName}\n`;

    if (file.sheets && file.sheets.length > 0) {
      file.sheets.forEach((sheet, sheetIdx) => {
        text += `   Sheet ${sheetIdx + 1}: "${sheet.sheetName}" (${sheet.requiredColumns.length} columns)\n`;
        text += `   Columns: ${sheet.requiredColumns.join(", ")}\n\n`;
      });
    }
    text += "\n";
  });

  text += `\nTOTAL: ${STRUCTURE_STATS.totalFiles} files, ${STRUCTURE_STATS.totalSheets} sheets, ${STRUCTURE_STATS.totalColumns} columns\n`;

  return text;
}
