/**
 * Expected structure for Study Excel files
 * Based on "Study 1" folder structure
 * THIS FILE IS AUTO-GENERATED - Contains ALL columns from ALL sheets
 */

export interface ExpectedFileStructure {
  expectedFileName: string;
  description: string;
  expectedSheets?: {
    sheetName: string;
    requiredColumns: string[];
  }[];
}

export const EXPECTED_FILES: ExpectedFileStructure[] = [
  {
    expectedFileName: 'CPID_EDC_Metrics.xlsx',
    description: 'CPID EDC Metrics Report',
    expectedSheets: [
      {
        sheetName: 'Subject Level Metrics',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject ID',
          'Latest Visit (SV) (Source: Rave EDC: BO4)',
          'Subject Status (Source: PRIMARY Form)',
          'Input files',
          'CPMD',
          'SSM'
        ],
      },
      {
        sheetName: 'Region_Country View',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject ID',
          'Visit Status (Source: J-review)',
          'Page Status (Source: (Rave EDC : BO4))',
          'Queries status (Source:(Rave EDC : BO4))',
          'PI Signatures (Source: (Rave EDC : BO4))',
          'Page Action Status (Source: (Rave EDC : BO4))',
          'Missing LNRs (Source: (J-review))'
        ],
      },
      {
        sheetName: 'Query Report - Cumulative',
        requiredColumns: [
          'Study',
          'Region',
          'Country',
          'Site Number',
          'Subject Name',
          'Folder Name',
          'Form',
          'Field OID',
          'Log #',
          'Visit Date',
          'Query Status',
          'Action Owner',
          'Marking Group Name',
          'Query Open Date',
          'Query Response Date',
          '# Days Since Open',
          '# Days Since Response'
        ],
      },
      {
        sheetName: 'Query Report - Site Action',
        requiredColumns: [
          'Study',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Folder Name',
          'Form',
          'Field OID',
          'Log #',
          'Visit Date',
          'Query Status',
          'Action Owner',
          'Marking Group Name',
          'Query Open Date',
          'Query Response Date',
          '# Days Since Open',
          '# Days Since Response'
        ],
      },
      {
        sheetName: 'Query Report - CRA Action',
        requiredColumns: [
          'Study',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Folder Name',
          'Form ',
          'Field OID',
          'Log #',
          'Visit Date',
          'Query Status',
          'Action Owner',
          'Marking Group Name',
          'Query Open Date',
          'Query Response Date',
          '# Days Since Open',
          '# Days Since Response'
        ],
      },
      {
        sheetName: 'Non conformant',
        requiredColumns: [
          'Study',
          'Region',
          'Country',
          'Study Site',
          'Subject Name',
          'Folder Name',
          'Page',
          'Log #',
          'Field OID',
          'Audit Time',
          'Visit date'
        ],
      },
      {
        sheetName: 'PI Signature Report',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Visit Name',
          'Data Page Name',
          'Page Require Signature',
          'Audit Action',
          'Visit Date',
          'Date page entered/ Date last PI Sign',
          'No. of days',
          'Pending since/ PI signed since'
        ],
      },
      {
        sheetName: 'SDV',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site',
          'Subject Name',
          'Folder Name',
          'Data Page Name',
          'Visit Date',
          'Verification Status'
        ],
      },
      {
        sheetName: 'Protocol Deviation',
        requiredColumns: [
          'Study',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Folder Name',
          'Data Page Name',
          'Log #',
          'PD Status',
          'Visit date'
        ],
      },
      {
        sheetName: 'CRF Freeze',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Data Page Name',
          'Freeze',
          'Visit date'
        ],
      },
      {
        sheetName: 'CRF UnFreeze',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Data Page Name',
          'UnFreeze',
          'Visit date'
        ],
      },
      {
        sheetName: 'CRF Locked',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Data Page Name',
          'Lock and Unlock',
          'Audit User',
          'Visit date'
        ],
      },
      {
        sheetName: 'CRF UnLocked',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Data Page Name',
          'Lock and Unlock',
          'Audit User',
          'Visit date'
        ],
      },
      {
        sheetName: 'SV',
        requiredColumns: [
          'Project Name',
          'Region',
          'Country',
          'Site ID',
          'Subject Name',
          'Folder Name',
          'Visit date'
        ],
      },
      {
        sheetName: 'Reports info -reference',
        requiredColumns: [
          'Report Name',
          'Content'
        ],
      }
    ],
  },
  {
    expectedFileName: 'Compiled_EDRR.xlsx',
    description: 'Compiled EDRR Report',
    expectedSheets: [
      {
        sheetName: 'OpenIssuesSummary',
        requiredColumns: [
          'Study',
          'Subject',
          'Total Open issue Count per subject',
          '.'
        ],
      }
    ],
  },
  {
    expectedFileName: 'GlobalCodingReport_MedDRA.xlsx',
    description: 'Global Coding Report - MedDRA',
    expectedSheets: [
      {
        sheetName: 'GlobalCodingReport_MedDRA',
        requiredColumns: [
          'MedDRA Coding Report',
          'Study',
          'Dictionary',
          'Dictionary Version number',
          'Subject',
          'Form OID',
          'Logline',
          'Field OID',
          'Coding Status',
          'Require Coding'
        ],
      }
    ],
  },
  {
    expectedFileName: 'GlobalCodingReport_WHODD.xlsx',
    description: 'Global Coding Report - WHODD',
    expectedSheets: [
      {
        sheetName: 'GlobalCodingReport_WHODD',
        requiredColumns: [
          'WHODrug Coding Report',
          'Study',
          'Dictionary',
          'Dictionary Version number',
          'Subject',
          'Form OID',
          'Logline',
          'Field OID',
          'Coding Status',
          'Require Coding'
        ],
      }
    ],
  },
  {
    expectedFileName: 'Inactivated_Forms_Folders_Records_Report.xlsx',
    description: 'Inactivated Forms, Folders and Records Report',
    expectedSheets: [
      {
        sheetName: 'Sheet1',
        requiredColumns: [
          'Country',
          'Study Site Number',
          'Subject',
          'Folder',
          'Form ',
          'Data on Form/
Record    ',
          'RecordPosition',
          'Audit Action'
        ],
      }
    ],
  },
  {
    expectedFileName: 'Missing_Lab_Name_and_Missing_Ranges.xlsx',
    description: 'Missing Lab Name and Missing Ranges Report',
    expectedSheets: [
      {
        sheetName: 'Missing_Lab_Name_and_Missing',
        requiredColumns: [
          'Country',
          'Site number',
          'Subject',
          'Visit',
          'Form Name',
          'Lab category',
          'Lab Date',
          'Test Name',
          'Test description',
          'Issue'
        ],
      }
    ],
  },
  {
    expectedFileName: 'Missing_Pages_Report.xlsx',
    description: 'Missing Pages Report',
    expectedSheets: [
      {
        sheetName: 'All Pages Missing',
        requiredColumns: [
          'Form Details',
          'Country',
          'Site Number',
          'Subject Name',
          'Visit Name',
          'Page Name',
          'Visit date',
          'Subject Status',
          '# of Days Missing'
        ],
      },
      {
        sheetName: 'Visit Level Pages Missing',
        requiredColumns: [
          'Form Details',
          'Country',
          'Site Number',
          'Subject Name',
          'Visit Name',
          'Page Name',
          'Visit date',
          'Subject Status',
          '# of Days Missing'
        ],
      }
    ],
  },
  {
    expectedFileName: 'Visit_Projection_Tracker.xlsx',
    description: 'Visit Projection Tracker',
    expectedSheets: [
      {
        sheetName: 'Missing Visits',
        requiredColumns: [
          'Country',
          'Site',
          'Subject',
          'Visit',
          'Projected Date',
          '# Days Outstanding'
        ],
      }
    ],
  },
  {
    expectedFileName: 'eSAE_Dashboard_Standard_DM_Safety_Report.xlsx',
    description: 'eSAE Dashboard Standard DM Safety Report',
    expectedSheets: [
      {
        sheetName: 'SAE Dashboard_DM',
        requiredColumns: [
          'Discrepancy ID',
          'Study ID',
          'Country',
          'Site',
          'Patient ID',
          'Form Name',
          'Discrepancy Created Timestamp in Dashboard',
          'Review Status',
          'Action Status'
        ],
      },
      {
        sheetName: 'SAE Dashboard_Safety',
        requiredColumns: [
          'Discrepancy ID',
          'Study ID',
          'Site',
          'Patient ID',
          'Case Status',
          'Discrepancy Created Timestamp in Dashboard',
          'Review Status',
          'Action Status'
        ],
      }
    ],
  }
];

export const REQUIRED_FILE_COUNT = 9;
