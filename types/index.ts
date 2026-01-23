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
  | "Site/CRA"
  | "DM"
  | "CSE/CDD"
  | "Coder"
  | "Safety Team"
  | "Investigator";

// File 1: CPID_EDC_Metrics - Master Report Card
export interface SubjectMetric {
  subjectId: string;
  siteId: string;
  siteName: string;
  country: string;
  region: Region;
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

// File 6: Global Missing Pages Report
export interface MissingPage {
  id: string;
  studyName: string;
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
  subjectId: string;
  siteId: string;
  totalOpenIssues: number;
}

// File 8: MedDRA Coding Report
export interface MedDRACoding {
  id: string;
  studyId: string;
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

// File 9: WHODrug Coding Report
export interface WHODrugCoding {
  id: string;
  studyId: string;
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
  region: Region | "ALL";
  country: string | "ALL";
  siteId: string | "ALL";
  subjectId: string | "ALL";
}

// KPI Summary
export interface KPISummary {
  totalMissingVisits: number;
  openQueries: number;
  seriousAdverseEvents: number;
  uncodedTerms: number;
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
