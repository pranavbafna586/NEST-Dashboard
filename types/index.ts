// types/index.ts - Type Definitions for Clinical Trial Intelligence Engine

export type SubjectStatus =
  | "On Trial"
  | "Discontinued"
  | "Screen Failure"
  | "Follow-Up"
  | "Survival"
  | "";

export type Region = "EMEA" | "ASIA" | "AMERICA";

export type QueryType =
  | "DM"
  | "Clinical"
  | "Medical"
  | "Site"
  | "FieldMonitor"
  | "Coding"
  | "Safety";

export type CodingStatus = "Coded Term" | "UnCoded Term";

export type SAEReviewStatus = "Review Completed" | "Pending for Review";

export type SAEActionStatus = "No action required" | "Pending" | "Action taken";

export type SAECaseStatus = "Closed" | "Locked" | "Open";

export type LabCategory =
  | "CHEMISTRY"
  | "HEMATOLOGY"
  | "COAGULATION"
  | "URINALYSIS";

export type ResponsibleFunction =
  | "Investigator"
  | "Site"
  | "CRA"
  | "Coder"
  | "DM"
  | "Safety Team"
  | "CDMD"
  | "CSE/CDD"
  | "CD LF";

// Role-based KPI configuration
export interface RoleKPIConfig {
  role: ResponsibleFunction;
  primaryResponsibility: string;
  criticalKPIs: string[];
}

// Define critical KPIs for each role
export const ROLE_KPI_MAPPING: RoleKPIConfig[] = [
  {
    role: "Investigator",
    primaryResponsibility: "Legal data verification and signing",
    criticalKPIs: ["crfsOverdue90Days", "brokenSignatures", "pdsConfirmed"],
  },
  {
    role: "Site",
    primaryResponsibility: "Direct patient data entry and hospital tasks",
    criticalKPIs: ["missingVisits", "missingPages", "queriesSite"],
  },
  {
    role: "CRA",
    primaryResponsibility: "On-site monitoring and source data verification",
    criticalKPIs: ["crfsRequireVerification", "openLabIssues", "missingPages"],
  },
  {
    role: "Coder",
    primaryResponsibility: "Medical terminology translation",
    criticalKPIs: ["uncodedMedDRA", "uncodedWHODrug", "queriesCoding"],
  },
  {
    role: "DM",
    primaryResponsibility: "Data quality and external reconciliation",
    criticalKPIs: ["queriesDM", "openEDRRIssues", "saeDMReview", "nonConformantPages"],
  },
  {
    role: "Safety Team",
    primaryResponsibility: "Medical safety and serious event tracking",
    criticalKPIs: ["activeSAEs", "saeSafetyReview", "queriesSafety"],
  },
  {
    role: "CDMD",
    primaryResponsibility: "Medical oversight of efficacy/safety",
    criticalKPIs: ["queriesMedical", "dualReviewConsistency"],
  },
  {
    role: "CSE/CDD",
    primaryResponsibility: "Clinical data expertise and deep review",
    criticalKPIs: ["pagesNonConformant", "queriesClinical", "nonConformantPages"],
  },
  {
    role: "CD LF",
    primaryResponsibility: "Lead Function oversight and study progress",
    criticalKPIs: ["studyPulse", "regionalProgress", "overallCompletion", "nonConformantPages"],
  },
];

// Role-based component visibility configuration
export interface RoleComponentVisibility {
  role: ResponsibleFunction;
  components: {
    kpiCards: boolean;
    studyPulse: boolean;
    regionalChart: boolean; // RegionStackedBarChart / CountryComposedChart / SubjectPerformanceGrid
    saeDonutChart: boolean;
    signatureComplianceChart: boolean;
    sitePerformanceTable: boolean;
    subjectTable: boolean;
    queryDistributionChart: boolean;
    queryResponseTimeTable: boolean;
    saeDistributionChart: boolean;
    conformantPagesChart: boolean;
    protocolDeviationChart: boolean;
    edrrIssuesChart: boolean;
    subjectEnrollmentFunnel: boolean;
  };
}

export const ROLE_COMPONENT_VISIBILITY: RoleComponentVisibility[] = [
  {
    role: "DM", // Data Manager
    components: {
      kpiCards: true, // DM-specific KPIs
      studyPulse: true, // Inherited from Study-Level
      regionalChart: true,
      saeDonutChart: false,
      signatureComplianceChart: false,
      sitePerformanceTable: true, // Query response time tracking
      subjectTable: true, // Subject-level query details
      queryDistributionChart: true, // Form-level error distribution
      queryResponseTimeTable: true, // Top 10 sites by response time
      saeDistributionChart: false,
      conformantPagesChart: true, // Inherited coding status
      protocolDeviationChart: false,
      edrrIssuesChart: true, // Total EDRR Issues
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "CRA", // Clinical Research Associate
    components: {
      kpiCards: true, // Forms requiring SDV
      studyPulse: true,
      regionalChart: true, // Lab data completeness
      saeDonutChart: false,
      signatureComplianceChart: true, // PI Signature Summary
      sitePerformanceTable: true, // Query response time
      subjectTable: true, // Lab test tracking
      queryDistributionChart: true, // Site-specific query breakdown
      queryResponseTimeTable: true,
      saeDistributionChart: false,
      conformantPagesChart: false,
      protocolDeviationChart: false,
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: true, // Total subjects enrolled
    },
  },
  {
    role: "Investigator",
    components: {
      kpiCards: true, // Site queries, signatures, missing pages/visits
      studyPulse: true,
      regionalChart: true,
      saeDonutChart: false,
      signatureComplianceChart: true, // Outstanding signatures
      sitePerformanceTable: true, // Query response time
      subjectTable: true, // Lab test tracking
      queryDistributionChart: false,
      queryResponseTimeTable: true,
      saeDistributionChart: false,
      conformantPagesChart: false,
      protocolDeviationChart: true, // Protocol deviation summary
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: true, // Subject retention funnel
    },
  },
  {
    role: "Safety Team",
    components: {
      kpiCards: true, // SAE review queries
      studyPulse: false,
      regionalChart: false,
      saeDonutChart: true, // SAE bar graph (top 5 studies)
      signatureComplianceChart: false,
      sitePerformanceTable: false,
      subjectTable: false,
      queryDistributionChart: true, // Medical coding queue
      queryResponseTimeTable: false,
      saeDistributionChart: true, // SAE distribution
      conformantPagesChart: false,
      protocolDeviationChart: true, // Protocol deviation
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "Coder",
    components: {
      kpiCards: true, // Coding-specific KPIs
      studyPulse: false,
      regionalChart: false,
      saeDonutChart: false,
      signatureComplianceChart: false,
      sitePerformanceTable: false,
      subjectTable: true, // Form-level coding details
      queryDistributionChart: true, // Coding status, medical coding queue
      queryResponseTimeTable: false,
      saeDistributionChart: false,
      conformantPagesChart: false,
      protocolDeviationChart: false,
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "CDMD", // Medical Team
    components: {
      kpiCards: true,
      studyPulse: false,
      regionalChart: false,
      saeDonutChart: true,
      signatureComplianceChart: false,
      sitePerformanceTable: false,
      subjectTable: false,
      queryDistributionChart: true,
      queryResponseTimeTable: false,
      saeDistributionChart: true,
      conformantPagesChart: false,
      protocolDeviationChart: true,
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "CSE/CDD", // Clinical Data Expert
    components: {
      kpiCards: true,
      studyPulse: true,
      regionalChart: true,
      saeDonutChart: false,
      signatureComplianceChart: false,
      sitePerformanceTable: true,
      subjectTable: true,
      queryDistributionChart: true,
      queryResponseTimeTable: true,
      saeDistributionChart: false,
      conformantPagesChart: true,
      protocolDeviationChart: false,
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "Site",
    components: {
      kpiCards: true,
      studyPulse: true,
      regionalChart: true,
      saeDonutChart: false,
      signatureComplianceChart: true,
      sitePerformanceTable: true,
      subjectTable: true,
      queryDistributionChart: true,
      queryResponseTimeTable: true,
      saeDistributionChart: false,
      conformantPagesChart: false,
      protocolDeviationChart: true,
      edrrIssuesChart: false,
      subjectEnrollmentFunnel: false,
    },
  },
  {
    role: "CD LF", // Lead Function - Executive View
    components: {
      kpiCards: true,
      studyPulse: true,
      regionalChart: true,
      saeDonutChart: true,
      signatureComplianceChart: true,
      sitePerformanceTable: true,
      subjectTable: true,
      queryDistributionChart: true,
      queryResponseTimeTable: true,
      saeDistributionChart: true,
      conformantPagesChart: true,
      protocolDeviationChart: true,
      edrrIssuesChart: true,
      subjectEnrollmentFunnel: true,
    },
  },
];

// Helper function to get component visibility for a role
export function getComponentVisibility(
  role?: ResponsibleFunction,
): RoleComponentVisibility["components"] {
  if (!role) {
    // Default: show all components if no role is selected
    return {
      kpiCards: true,
      studyPulse: true,
      regionalChart: true,
      saeDonutChart: true,
      signatureComplianceChart: true,
      sitePerformanceTable: true,
      subjectTable: true,
      queryDistributionChart: true,
      queryResponseTimeTable: true,
      saeDistributionChart: true,
      conformantPagesChart: true,
      protocolDeviationChart: true,
      edrrIssuesChart: true,
      subjectEnrollmentFunnel: true,
    };
  }

  const config = ROLE_COMPONENT_VISIBILITY.find((c) => c.role === role);
  return config
    ? config.components
    : ROLE_COMPONENT_VISIBILITY[ROLE_COMPONENT_VISIBILITY.length - 1]
        .components; // Default to CD LF (all)
}

// File 1: CPID_EDC_Metrics - Master Report Card
export interface SubjectMetric {
  subjectId: string;
  siteId: string;
  siteName: string;
  country: string;
  region: Region;
  studyId: string; // New: Study identifier (STUDY-01 to STUDY-25)
  projectName: string;
  status: SubjectStatus;
  latestVisit: string;
  // Missing data metrics
  missingVisits: number;
  missingPages: number;
  // Coding metrics
  codedTerms: number;
  uncodedTerms: number;
  // Lab issues
  openLabIssues: number;
  openEDRRIssues: number;
  // Form status
  inactivatedForms: number;
  inputFiles: number;
  // Safety metrics
  saeDMReview: number;
  saeSafetyReview: number;
  // Visit & page status
  expectedVisits: number;
  pagesEntered: number;
  totalFormsAvailable: number; // New: Total "Expected" forms for tracking workload
  pagesNonConformant: number;
  // Query tracking
  queriesDM: number;
  queriesClinical: number;
  queriesMedical: number;
  queriesSite: number;
  queriesFieldMonitor: number;
  queriesCoding: number;
  queriesSafety: number;
  totalQueries: number;
  // Verification status
  crfsRequireVerification: number;
  formsVerified: number;
  // Lock status
  crfsFrozen: number;
  crfsNotFrozen: number;
  crfsLocked: number;
  crfsUnlocked: number;
  // Protocol deviations
  pdsConfirmed: number;
  pdsProposed: number;
  // Signature status
  crfsSigned: number;
  crfsOverdue45Days: number;
  crfsOverdue45to90Days: number;
  crfsOverdue90Days: number;
  brokenSignatures: number;
  crfsNeverSigned: number;
  // Calculated fields
  isHighRisk: boolean;
  dataQualityScore: number;
  responsibleFunction: ResponsibleFunction;
  // DQI and Clean Status
  dqiScore: number | null;
  dqiCategory: string | null;
  isClean: boolean | null;
}

// File 2: Visit Projection Tracker
export interface MissingVisit {
  id: string;
  subjectId: string;
  siteId: string;
  studyId: string;
  projectName: string;
  country: string;
  region: Region;
  visitName: string;
  projectedDate: string;
  daysOutstanding: number;
  status: "Missing" | "Overdue" | "Pending";
}

// File 3: Missing Lab Name and Missing Ranges
export interface LabIssue {
  id: string;
  subjectId: string;
  siteId: string;
  studyId: string;
  projectName: string;
  country: string;
  visitName: string;
  formName: string;
  labCategory: LabCategory;
  labName: string;
  labDate: string;
  testName: string;
  testDescription: string;
  issue: "Ranges/Units not entered" | "Missing Lab name";
  actionFor: "Action for CRA" | "Action for Site";
}

// File 4: SAE Dashboard
export interface SAERecord {
  id: string;
  projectName: string;
  discrepancyId: string;
  studyId: string;
  subjectId: string;
  siteId: string;
  country: string;
  region: Region;
  formName: string;
  event: string;
  createdTimestamp: string;
  dmReviewStatus: SAEReviewStatus;
  dmActionStatus: SAEActionStatus;
  safetyReviewStatus: SAEReviewStatus;
  safetyActionStatus: SAEActionStatus;
  caseStatus: SAECaseStatus;
}

// File 5: Inactivated Forms
export interface InactivatedForm {
  id: string;
  subjectId: string;
  studyId: string;
  projectName: string;
  siteId: string;
  country: string;
  siteNumber: string;
  folder: string;
  formName: string;
  hasData: boolean;
  recordPosition: number;
  auditAction: string;
  reason: string;
}

// FileId: string;

export interface MissingPage {
  id: string;
  studyId: string;
  studyName: string;
  projectName: string;
  subjectId: string;
  siteId: string;
  country: string;
  region: Region;
  overallStatus: SubjectStatus;
  visitLevelStatus: SubjectStatus;
  folderName: string;
  visitDate: string;
  formType: "Visit" | "Summary";
  formName: string;
  daysMissing: number;
}

// File 7: Compiled EDRR
export interface EDRRIssue {
  id: string;
  studyId: string;
  projectName: string;
  subjectId: string;
  siteId: string;
  totalOpenIssues: number;
}

// File 8: MedDRA Coding Report
export interface MedDRACoding {
  id: string;
  studyId: string;
  projectName: string;
  subjectId: string;
  siteId: string;
  dictionary: string;
  dictionaryVersion: string;
  formName: "Adverse Events" | "Medical History" | "Prior Medications";
  formOID: string;
  logline: number;
  fieldOID: string;
  term: string;
  supplementTerm: string;
  codingStatus: CodingStatus;
  requireCoding: boolean;
}

//projectName: string;
//  File 9: WHODrug Coding Report
export interface WHODrugCoding {
  id: string;
  studyId: string;
  projectName: string;
  subjectId: string;
  siteId: string;
  dictionary: string;
  dictionaryVersion: string;
  formName:
    | "Antineoplastic Medications"
    | "Prior or Concomitant Medications"
    | "Medical History - Medications";
  formOID: string;
  logline: number;
  fieldOID: string;
  tradeName: string;
  codingStatus: CodingStatus;
  requireCoding: boolean;
}

// Dashboard filter state
export interface FilterState {
  studyId: string | "ALL"; // New: Study filter
  region: Region | "ALL";
  country: string | "ALL";
  siteId: string | "ALL";
  subjectId: string | "ALL";
  role?: ResponsibleFunction; // New: Current user role for RBAC
}

// KPI Summary
export interface KPISummary {
  totalMissingVisits: number;
  openQueries: number;
  seriousAdverseEvents: number;
  uncodedTerms: number;
  totalSubjects?: number;
  conformantPagesPercentage?: number;
  protocolDeviationsConfirmed?: number;
  averageDQI?: number;
  cleanPatientCount?: number;
  totalPatients?: number;
  cleanPercentage?: number;
  totalConformantPages?: number;
  totalProtocolDeviations?: number;
  totalNonConformantPages?: number;
}

// Chart data types
export interface RegionChartData {
  name: string;
  missingPages: number;
  completedPages: number;
  queries: number;
  totalSubjects: number;
}

export interface SitePerformanceData {
  siteId: string;
  siteName: string;
  country: string;
  region: Region;
  openQueries: number;
  avgDaysOutstanding: number;
  signatureBacklog: number;
  dataQualityScore: number;
  subjectCount: number;
  avgDQIScore?: number;
  cleanSubjects?: number;
  uncleanSubjects?: number;
}

export interface SAEChartData {
  name: string;
  value: number;
  color: string;
}

export interface PatientVisitData {
  visitName: string;
  projectedDate: string;
  status: "Completed" | "Missing" | "Upcoming" | "Overdue";
  daysOutstanding?: number;
}

export interface CodingCategoryData {
  name: string;
  size: number;
  coded: number;
  uncoded: number;
  color: string;
}
