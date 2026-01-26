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
    criticalKPIs: ["queriesDM", "openEDRRIssues", "saeDMReview"],
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
    criticalKPIs: ["pagesNonConformant", "queriesClinical"],
  },
  {
    role: "CD LF",
    primaryResponsibility: "Lead Function oversight and study progress",
    criticalKPIs: ["studyPulse", "regionalProgress", "overallCompletion"],
  },
];

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
