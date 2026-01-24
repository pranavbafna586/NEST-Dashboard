// mockData.ts - Comprehensive Relational Mock Data for Clinical Trial Intelligence Engine
// This file represents data from all 9 Excel files with proper relationships
// Updated for multi-study environment (25 studies) with RBAC support

import {
  SubjectMetric,
  MissingVisit,
  LabIssue,
  SAERecord,
  InactivatedForm,
  MissingPage,
  EDRRIssue,
  MedDRACoding,
  WHODrugCoding,
  Region,
  RegionChartData,
  SitePerformanceData,
  SAEChartData,
  PatientVisitData,
  CodingCategoryData,
  KPISummary,
  FilterState,
  ResponsibleFunction,
} from "@/types";

// Helper function to generate study IDs
const generateStudyId = (num: number): string => {
  return `STUDY-${String(num).padStart(2, "0")}`;
};

// Helper function to generate project names
const generateProjectName = (num: number): string => {
  const projectTypes = [
    "Oncology Phase III",
    "Cardiology Phase II",
    "Neurology Phase III",
    "Immunology Phase II",
    "Diabetes Phase III",
    "Rare Disease Phase II",
    "COVID-19 Phase III",
    "Alzheimer's Phase II",
    "Pediatric Oncology Phase III",
    "Gene Therapy Phase I/II",
  ];
  return `${projectTypes[num % projectTypes.length]} - Study ${num}`;
};

// Helper to rotate through responsible functions
const getResponsibleFunction = (index: number): ResponsibleFunction => {
  const functions: ResponsibleFunction[] = [
    "Site",
    "CRA",
    "Investigator",
    "Coder",
    "DM",
    "Safety Team",
    "CDMD",
    "CSE/CDD",
    "CD LF",
  ];
  return functions[index % functions.length];
};

// ============================================
// FILE 1: CPID_EDC_Metrics - Master Report Card
// ============================================
export const masterMetrics: SubjectMetric[] = [
  {
    subjectId: "SUB-001",
    siteId: "SITE-14",
    siteName: "Hospital Central Madrid",
    country: "Spain",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "Screen Failure",
    latestVisit: "Screening",
    missingVisits: 0,
    missingPages: 0,
    codedTerms: 0,
    uncodedTerms: 2,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 0,
    inputFiles: 1,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 1,
    pagesEntered: 9,
    totalFormsAvailable: 15,
    pagesNonConformant: 0,
    queriesDM: 0,
    queriesClinical: 0,
    queriesMedical: 0,
    queriesSite: 0,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 0,
    crfsRequireVerification: 0,
    formsVerified: 0,
    crfsFrozen: 0,
    crfsNotFrozen: 9,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 8,
    crfsOverdue45Days: 0,
    crfsOverdue45to90Days: 0,
    crfsOverdue90Days: 0,
    brokenSignatures: 0,
    crfsNeverSigned: 1,
    isHighRisk: false,
    dataQualityScore: 100,
    responsibleFunction: "Site",
  },
  {
    subjectId: "SUB-002",
    siteId: "SITE-14",
    siteName: "Hospital Central Madrid",
    country: "Spain",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "Discontinued",
    latestVisit: "W8D1",
    missingVisits: 3,
    missingPages: 13,
    codedTerms: 2,
    uncodedTerms: 1,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 2,
    inputFiles: 3,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 15,
    pagesEntered: 187,
    totalFormsAvailable: 225,
    pagesNonConformant: 1,
    queriesDM: 4,
    queriesClinical: 2,
    queriesMedical: 0,
    queriesSite: 5,
    queriesFieldMonitor: 2,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 13,
    crfsRequireVerification: 45,
    formsVerified: 215,
    crfsFrozen: 2,
    crfsNotFrozen: 185,
    crfsLocked: 0,
    crfsUnlocked: 2,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 216,
    crfsOverdue45Days: 3,
    crfsOverdue45to90Days: 5,
    crfsOverdue90Days: 2,
    brokenSignatures: 0,
    crfsNeverSigned: 8,
    isHighRisk: true,
    dataQualityScore: 78,
    responsibleFunction: "CRA",
  },
  {
    subjectId: "SUB-003",
    siteId: "SITE-18",
    siteName: "University Hospital Paris",
    country: "France",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W12D1",
    missingVisits: 1,
    missingPages: 4,
    codedTerms: 3,
    uncodedTerms: 0,
    openLabIssues: 2,
    openEDRRIssues: 0,
    inactivatedForms: 1,
    inputFiles: 2,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 20,
    pagesEntered: 245,
    totalFormsAvailable: 300,
    pagesNonConformant: 0,
    queriesDM: 2,
    queriesClinical: 1,
    queriesMedical: 0,
    queriesSite: 3,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 6,
    crfsRequireVerification: 30,
    formsVerified: 180,
    crfsFrozen: 0,
    crfsNotFrozen: 245,
    crfsLocked: 0,
    crfsUnlocked: 2,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 230,
    crfsOverdue45Days: 5,
    crfsOverdue45to90Days: 8,
    crfsOverdue90Days: 2,
    brokenSignatures: 0,
    crfsNeverSigned: 15,
    isHighRisk: false,
    dataQualityScore: 92,
    responsibleFunction: "Investigator",
  },
  {
    subjectId: "SUB-004",
    siteId: "SITE-18",
    siteName: "University Hospital Paris",
    country: "France",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "Cycle 6 Week 1",
    missingVisits: 2,
    missingPages: 7,
    codedTerms: 1,
    uncodedTerms: 3,
    openLabIssues: 1,
    openEDRRIssues: 0,
    inactivatedForms: 0,
    inputFiles: 2,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 18,
    pagesEntered: 198,
    totalFormsAvailable: 270,
    pagesNonConformant: 0,
    queriesDM: 3,
    queriesClinical: 2,
    queriesMedical: 1,
    queriesSite: 4,
    queriesFieldMonitor: 1,
    queriesCoding: 1,
    queriesSafety: 0,
    totalQueries: 12,
    crfsRequireVerification: 55,
    formsVerified: 140,
    crfsFrozen: 1,
    crfsNotFrozen: 197,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 180,
    crfsOverdue45Days: 8,
    crfsOverdue45to90Days: 6,
    crfsOverdue90Days: 4,
    brokenSignatures: 2,
    crfsNeverSigned: 18,
    isHighRisk: false,
    dataQualityScore: 85,
    responsibleFunction: "Coder",
  },
  {
    subjectId: "SUB-005",
    siteId: "SITE-05",
    siteName: "Vienna Medical Center",
    country: "Austria",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W1D3",
    missingVisits: 19,
    missingPages: 2,
    codedTerms: 0,
    uncodedTerms: 0,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 19,
    inputFiles: 1,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 25,
    pagesEntered: 45,
    totalFormsAvailable: 375,
    pagesNonConformant: 0,
    queriesDM: 1,
    queriesClinical: 0,
    queriesMedical: 0,
    queriesSite: 19,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 20,
    crfsRequireVerification: 20,
    formsVerified: 25,
    crfsFrozen: 0,
    crfsNotFrozen: 45,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 40,
    crfsOverdue45Days: 2,
    crfsOverdue45to90Days: 3,
    crfsOverdue90Days: 0,
    brokenSignatures: 0,
    crfsNeverSigned: 44,
    isHighRisk: true,
    dataQualityScore: 65,
    responsibleFunction: "Site",
  },
  {
    subjectId: "SUB-006",
    siteId: "SITE-12",
    siteName: "Berlin Clinical Research",
    country: "Germany",
    region: "EMEA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "Follow-up Week 52",
    missingVisits: 0,
    missingPages: 0,
    codedTerms: 5,
    uncodedTerms: 0,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 3,
    inputFiles: 4,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 26,
    pagesEntered: 312,
    totalFormsAvailable: 390,
    pagesNonConformant: 0,
    queriesDM: 0,
    queriesClinical: 0,
    queriesMedical: 0,
    queriesSite: 0,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 0,
    crfsRequireVerification: 15,
    formsVerified: 287,
    crfsFrozen: 0,
    crfsNotFrozen: 312,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 300,
    crfsOverdue45Days: 0,
    crfsOverdue45to90Days: 5,
    crfsOverdue90Days: 7,
    brokenSignatures: 0,
    crfsNeverSigned: 12,
    isHighRisk: false,
    dataQualityScore: 98,
    responsibleFunction: "CRA",
  },
  {
    subjectId: "SUB-007",
    siteId: "SITE-27",
    siteName: "Boston Medical Center",
    country: "USA",
    region: "AMERICA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "Follow-up Week 104",
    missingVisits: 21,
    missingPages: 0,
    codedTerms: 4,
    uncodedTerms: 2,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 21,
    inputFiles: 5,
    saeDMReview: 2,
    saeSafetyReview: 2,
    expectedVisits: 29,
    pagesEntered: 408,
    totalFormsAvailable: 435,
    pagesNonConformant: 0,
    queriesDM: 8,
    queriesClinical: 5,
    queriesMedical: 3,
    queriesSite: 21,
    queriesFieldMonitor: 0,
    queriesCoding: 1,
    queriesSafety: 0,
    totalQueries: 38,
    crfsRequireVerification: 85,
    formsVerified: 290,
    crfsFrozen: 3,
    crfsNotFrozen: 405,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 1,
    pdsProposed: 0,
    crfsSigned: 291,
    crfsOverdue45Days: 13,
    crfsOverdue45to90Days: 66,
    crfsOverdue90Days: 6,
    brokenSignatures: 3,
    crfsNeverSigned: 82,
    isHighRisk: true,
    dataQualityScore: 72,
    responsibleFunction: "DM",
  },
  {
    subjectId: "SUB-008",
    siteId: "SITE-27",
    siteName: "Boston Medical Center",
    country: "USA",
    region: "AMERICA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W24D1",
    missingVisits: 5,
    missingPages: 8,
    codedTerms: 2,
    uncodedTerms: 1,
    openLabIssues: 3,
    openEDRRIssues: 1,
    inactivatedForms: 4,
    inputFiles: 3,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 30,
    pagesEntered: 285,
    totalFormsAvailable: 450,
    pagesNonConformant: 1,
    queriesDM: 5,
    queriesClinical: 3,
    queriesMedical: 2,
    queriesSite: 8,
    queriesFieldMonitor: 2,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 20,
    crfsRequireVerification: 70,
    formsVerified: 195,
    crfsFrozen: 1,
    crfsNotFrozen: 284,
    crfsLocked: 0,
    crfsUnlocked: 1,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 250,
    crfsOverdue45Days: 10,
    crfsOverdue45to90Days: 15,
    crfsOverdue90Days: 10,
    brokenSignatures: 1,
    crfsNeverSigned: 35,
    isHighRisk: true,
    dataQualityScore: 75,
    responsibleFunction: "Safety Team",
  },
  {
    subjectId: "SUB-009",
    siteId: "SITE-31",
    siteName: "Chicago Research Institute",
    country: "USA",
    region: "AMERICA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "Cycle 8 Week 2",
    missingVisits: 4,
    missingPages: 12,
    codedTerms: 1,
    uncodedTerms: 4,
    openLabIssues: 0,
    openEDRRIssues: 2,
    inactivatedForms: 6,
    inputFiles: 4,
    saeDMReview: 2,
    saeSafetyReview: 3,
    expectedVisits: 28,
    pagesEntered: 320,
    totalFormsAvailable: 420,
    pagesNonConformant: 2,
    queriesDM: 6,
    queriesClinical: 4,
    queriesMedical: 2,
    queriesSite: 31,
    queriesFieldMonitor: 2,
    queriesCoding: 2,
    queriesSafety: 1,
    totalQueries: 48,
    crfsRequireVerification: 190,
    formsVerified: 100,
    crfsFrozen: 2,
    crfsNotFrozen: 318,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 1,
    pdsProposed: 1,
    crfsSigned: 270,
    crfsOverdue45Days: 49,
    crfsOverdue45to90Days: 30,
    crfsOverdue90Days: 21,
    brokenSignatures: 20,
    crfsNeverSigned: 50,
    isHighRisk: true,
    dataQualityScore: 62,
    responsibleFunction: "CDMD",
  },
  {
    subjectId: "SUB-010",
    siteId: "SITE-42",
    siteName: "São Paulo Cancer Center",
    country: "Brazil",
    region: "AMERICA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W16D1",
    missingVisits: 2,
    missingPages: 5,
    codedTerms: 3,
    uncodedTerms: 1,
    openLabIssues: 1,
    openEDRRIssues: 0,
    inactivatedForms: 2,
    inputFiles: 2,
    saeDMReview: 5,
    saeSafetyReview: 4,
    expectedVisits: 22,
    pagesEntered: 178,
    totalFormsAvailable: 330,
    pagesNonConformant: 0,
    queriesDM: 3,
    queriesClinical: 2,
    queriesMedical: 1,
    queriesSite: 5,
    queriesFieldMonitor: 5,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 16,
    crfsRequireVerification: 45,
    formsVerified: 120,
    crfsFrozen: 0,
    crfsNotFrozen: 178,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 160,
    crfsOverdue45Days: 8,
    crfsOverdue45to90Days: 6,
    crfsOverdue90Days: 4,
    brokenSignatures: 0,
    crfsNeverSigned: 18,
    isHighRisk: false,
    dataQualityScore: 82,
    responsibleFunction: "CSE/CDD",
  },
  {
    subjectId: "SUB-011",
    siteId: "SITE-55",
    siteName: "Tokyo University Hospital",
    country: "Japan",
    region: "ASIA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W20D1",
    missingVisits: 1,
    missingPages: 2,
    codedTerms: 4,
    uncodedTerms: 0,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 1,
    inputFiles: 3,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 24,
    pagesEntered: 267,
    totalFormsAvailable: 360,
    pagesNonConformant: 0,
    queriesDM: 1,
    queriesClinical: 0,
    queriesMedical: 0,
    queriesSite: 2,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 3,
    crfsRequireVerification: 20,
    formsVerified: 230,
    crfsFrozen: 0,
    crfsNotFrozen: 267,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 260,
    crfsOverdue45Days: 2,
    crfsOverdue45to90Days: 3,
    crfsOverdue90Days: 2,
    brokenSignatures: 0,
    crfsNeverSigned: 7,
    isHighRisk: false,
    dataQualityScore: 95,
    responsibleFunction: "CD LF",
  },
  {
    subjectId: "SUB-012",
    siteId: "SITE-55",
    siteName: "Tokyo University Hospital",
    country: "Japan",
    region: "ASIA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "Cycle 4 Week 3",
    missingVisits: 0,
    missingPages: 1,
    codedTerms: 2,
    uncodedTerms: 1,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 0,
    inputFiles: 2,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 18,
    pagesEntered: 198,
    totalFormsAvailable: 270,
    pagesNonConformant: 0,
    queriesDM: 0,
    queriesClinical: 1,
    queriesMedical: 2,
    queriesSite: 1,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 4,
    crfsRequireVerification: 12,
    formsVerified: 175,
    crfsFrozen: 0,
    crfsNotFrozen: 198,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 190,
    crfsOverdue45Days: 3,
    crfsOverdue45to90Days: 2,
    crfsOverdue90Days: 3,
    brokenSignatures: 0,
    crfsNeverSigned: 8,
    isHighRisk: false,
    dataQualityScore: 94,
    responsibleFunction: "Site",
  },
  {
    subjectId: "SUB-013",
    siteId: "SITE-60",
    siteName: "Seoul National Hospital",
    country: "South Korea",
    region: "ASIA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W8D1",
    missingVisits: 3,
    missingPages: 6,
    codedTerms: 1,
    uncodedTerms: 2,
    openLabIssues: 2,
    openEDRRIssues: 1,
    inactivatedForms: 2,
    inputFiles: 2,
    saeDMReview: 1,
    saeSafetyReview: 1,
    expectedVisits: 20,
    pagesEntered: 145,
    totalFormsAvailable: 300,
    pagesNonConformant: 1,
    queriesDM: 4,
    queriesClinical: 2,
    queriesMedical: 1,
    queriesSite: 6,
    queriesFieldMonitor: 1,
    queriesCoding: 1,
    queriesSafety: 0,
    totalQueries: 15,
    crfsRequireVerification: 40,
    formsVerified: 95,
    crfsFrozen: 1,
    crfsNotFrozen: 144,
    crfsLocked: 0,
    crfsUnlocked: 1,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 130,
    crfsOverdue45Days: 6,
    crfsOverdue45to90Days: 5,
    crfsOverdue90Days: 4,
    brokenSignatures: 1,
    crfsNeverSigned: 15,
    isHighRisk: true,
    dataQualityScore: 78,
    responsibleFunction: "CRA",
  },
  {
    subjectId: "SUB-014",
    siteId: "SITE-65",
    siteName: "Shanghai Medical Center",
    country: "China",
    region: "ASIA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "On Trial",
    latestVisit: "W12D1",
    missingVisits: 2,
    missingPages: 4,
    codedTerms: 4,
    uncodedTerms: 3,
    openLabIssues: 1,
    openEDRRIssues: 0,
    inactivatedForms: 1,
    inputFiles: 3,
    saeDMReview: 0,
    saeSafetyReview: 0,
    expectedVisits: 22,
    pagesEntered: 210,
    totalFormsAvailable: 330,
    pagesNonConformant: 0,
    queriesDM: 4,
    queriesClinical: 2,
    queriesMedical: 0,
    queriesSite: 3,
    queriesFieldMonitor: 3,
    queriesCoding: 2,
    queriesSafety: 0,
    totalQueries: 14,
    crfsRequireVerification: 50,
    formsVerified: 145,
    crfsFrozen: 0,
    crfsNotFrozen: 210,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 0,
    pdsProposed: 0,
    crfsSigned: 195,
    crfsOverdue45Days: 5,
    crfsOverdue45to90Days: 6,
    crfsOverdue90Days: 4,
    brokenSignatures: 0,
    crfsNeverSigned: 15,
    isHighRisk: false,
    dataQualityScore: 85,
    responsibleFunction: "Coder",
  },
  {
    subjectId: "SUB-015",
    siteId: "SITE-70",
    siteName: "Singapore General Hospital",
    country: "Singapore",
    region: "ASIA",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    status: "Discontinued",
    latestVisit: "W4D1",
    missingVisits: 0,
    missingPages: 0,
    codedTerms: 1,
    uncodedTerms: 0,
    openLabIssues: 0,
    openEDRRIssues: 0,
    inactivatedForms: 15,
    inputFiles: 1,
    saeDMReview: 1,
    saeSafetyReview: 1,
    expectedVisits: 8,
    pagesEntered: 85,
    totalFormsAvailable: 120,
    pagesNonConformant: 0,
    queriesDM: 0,
    queriesClinical: 0,
    queriesMedical: 0,
    queriesSite: 0,
    queriesFieldMonitor: 0,
    queriesCoding: 0,
    queriesSafety: 0,
    totalQueries: 0,
    crfsRequireVerification: 5,
    formsVerified: 75,
    crfsFrozen: 0,
    crfsNotFrozen: 85,
    crfsLocked: 0,
    crfsUnlocked: 0,
    pdsConfirmed: 1,
    pdsProposed: 0,
    crfsSigned: 80,
    crfsOverdue45Days: 0,
    crfsOverdue45to90Days: 2,
    crfsOverdue90Days: 3,
    brokenSignatures: 0,
    crfsNeverSigned: 5,
    isHighRisk: false,
    dataQualityScore: 100,
    responsibleFunction: "Investigator",
  },
];

// Generate additional subjects for studies 2-25
for (let studyNum = 2; studyNum <= 25; studyNum++) {
  const studyId = generateStudyId(studyNum);
  const projectName = generateProjectName(studyNum);
  const regionsPool: Region[] = ["EMEA", "ASIA", "AMERICA"];
  const region = regionsPool[studyNum % 3];

  // Add 3-5 subjects per study
  const subjectsInStudy = 3 + (studyNum % 3);
  for (let subj = 0; subj < subjectsInStudy; subj++) {
    const subjectNum = 15 + (studyNum - 2) * 5 + subj + 1;
    const siteNum = 10 + (studyNum % 15) + subj;

    masterMetrics.push({
      subjectId: `SUB-${String(subjectNum).padStart(3, "0")}`,
      siteId: `SITE-${String(siteNum).padStart(2, "0")}`,
      siteName:
        region === "EMEA"
          ? [
              "Hospital Central Madrid",
              "University Hospital Paris",
              "Berlin Clinical Research",
              "Vienna Medical Center",
            ][subj % 4]
          : region === "ASIA"
            ? [
                "Tokyo University Hospital",
                "Seoul National Hospital",
                "Shanghai Medical Center",
                "Singapore General Hospital",
              ][subj % 4]
            : [
                "Boston Medical Center",
                "Chicago Research Institute",
                "São Paulo Cancer Center",
                "Toronto General Hospital",
              ][subj % 4],
      country:
        region === "EMEA"
          ? ["Spain", "France", "Germany", "Austria"][subj % 4]
          : region === "ASIA"
            ? ["Japan", "South Korea", "China", "Singapore"][subj % 4]
            : ["USA", "USA", "Brazil", "Canada"][subj % 4],
      region,
      studyId,
      projectName,
      status: ["On Trial", "On Trial", "Discontinued", "Follow-Up"][
        subj % 4
      ] as any,
      latestVisit: ["W8D1", "W12D1", "W16D1", "Cycle 4 Week 2"][subj % 4],
      missingVisits: [1, 2, 0, 3][subj % 4],
      missingPages: [5, 3, 0, 8][subj % 4],
      codedTerms: [2, 3, 4, 1][subj % 4],
      uncodedTerms: [1, 0, 2, 3][subj % 4],
      openLabIssues: [0, 1, 0, 2][subj % 4],
      openEDRRIssues: [0, 0, 1, 0][subj % 4],
      inactivatedForms: [1, 0, 2, 1][subj % 4],
      inputFiles: [2, 3, 2, 4][subj % 4],
      saeDMReview: [0, 1, 0, 2][subj % 4],
      saeSafetyReview: [0, 1, 0, 2][subj % 4],
      expectedVisits: [18, 20, 15, 25][subj % 4],
      pagesEntered: [180, 220, 150, 280][subj % 4],
      totalFormsAvailable: [270, 300, 225, 375][subj % 4],
      pagesNonConformant: [0, 1, 0, 2][subj % 4],
      queriesDM: [2, 3, 1, 5][subj % 4],
      queriesClinical: [1, 2, 0, 3][subj % 4],
      queriesMedical: [0, 1, 0, 2][subj % 4],
      queriesSite: [3, 4, 2, 6][subj % 4],
      queriesFieldMonitor: [1, 0, 1, 2][subj % 4],
      queriesCoding: [0, 1, 0, 2][subj % 4],
      queriesSafety: [0, 0, 0, 1][subj % 4],
      totalQueries: [7, 11, 4, 21][subj % 4],
      crfsRequireVerification: [25, 40, 15, 60][subj % 4],
      formsVerified: [155, 180, 135, 220][subj % 4],
      crfsFrozen: [0, 1, 0, 2][subj % 4],
      crfsNotFrozen: [180, 219, 150, 278][subj % 4],
      crfsLocked: [0, 0, 0, 0][subj % 4],
      crfsUnlocked: [0, 1, 0, 2][subj % 4],
      pdsConfirmed: [0, 0, 1, 0][subj % 4],
      pdsProposed: [0, 1, 0, 0][subj % 4],
      crfsSigned: [170, 210, 145, 260][subj % 4],
      crfsOverdue45Days: [3, 5, 2, 8][subj % 4],
      crfsOverdue45to90Days: [4, 6, 3, 10][subj % 4],
      crfsOverdue90Days: [2, 3, 1, 5][subj % 4],
      brokenSignatures: [0, 1, 0, 2][subj % 4],
      crfsNeverSigned: [10, 15, 8, 20][subj % 4],
      isHighRisk: [false, true, false, true][subj % 4],
      dataQualityScore: [92, 85, 95, 78][subj % 4],
      responsibleFunction: getResponsibleFunction(subjectNum),
    });
  }
}

// ============================================
// FILE 2: Visit Projection Tracker - Missing Visits
// ============================================
export const missingVisitsDetail: MissingVisit[] = [
  {
    id: "MV-001",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    region: "AMERICA",
    visitName: "Cycle 12 Week 1",
    projectedDate: "2025-10-15",
    daysOutstanding: 32,
    status: "Overdue",
  },
  {
    id: "MV-002",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    region: "AMERICA",
    visitName: "Week 7 Visit",
    projectedDate: "2025-11-01",
    daysOutstanding: 16,
    status: "Overdue",
  },
  {
    id: "MV-003",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Spain",
    region: "EMEA",
    visitName: "Week 10 Visit",
    projectedDate: "2025-11-10",
    daysOutstanding: 9,
    status: "Overdue",
  },
  {
    id: "MV-004",
    subjectId: "SUB-005",
    siteId: "SITE-05",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Austria",
    region: "EMEA",
    visitName: "W2D1",
    projectedDate: "2025-09-20",
    daysOutstanding: 65,
    status: "Overdue",
  },
  {
    id: "MV-005",
    subjectId: "SUB-005",
    siteId: "SITE-05",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Austria",
    region: "EMEA",
    visitName: "W3D1",
    projectedDate: "2025-09-27",
    daysOutstanding: 58,
    status: "Overdue",
  },
  {
    id: "MV-006",
    subjectId: "SUB-005",
    siteId: "SITE-05",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Austria",
    region: "EMEA",
    visitName: "W4D1",
    projectedDate: "2025-10-04",
    daysOutstanding: 51,
    status: "Overdue",
  },
  {
    id: "MV-007",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    region: "AMERICA",
    visitName: "Cycle 5 Week 2",
    projectedDate: "2025-10-20",
    daysOutstanding: 27,
    status: "Overdue",
  },
  {
    id: "MV-008",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    region: "AMERICA",
    visitName: "Week 12 Day 1",
    projectedDate: "2025-11-05",
    daysOutstanding: 12,
    status: "Overdue",
  },
  {
    id: "MV-009",
    subjectId: "SUB-003",
    siteId: "SITE-18",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "France",
    region: "EMEA",
    visitName: "30 Day Follow-Up",
    projectedDate: "2025-11-15",
    daysOutstanding: 5,
    status: "Pending",
  },
  {
    id: "MV-010",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "South Korea",
    region: "ASIA",
    visitName: "Cycle 3 Week 1",
    projectedDate: "2025-10-28",
    daysOutstanding: 19,
    status: "Overdue",
  },
  {
    id: "MV-011",
    subjectId: "SUB-014",
    siteId: "SITE-65",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "China",
    region: "ASIA",
    visitName: "Week 14 Visit",
    projectedDate: "2025-11-08",
    daysOutstanding: 8,
    status: "Pending",
  },
  {
    id: "MV-012",
    subjectId: "SUB-010",
    siteId: "SITE-42",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Brazil",
    region: "AMERICA",
    visitName: "Week 18 Visit",
    projectedDate: "2025-11-12",
    daysOutstanding: 4,
    status: "Pending",
  },
];

// ============================================
// FILE 3: Missing Lab Name and Missing Ranges
// ============================================
export const labIssues: LabIssue[] = [
  {
    id: "LAB-001",
    subjectId: "SUB-003",
    siteId: "SITE-18",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "France",
    visitName: "W8D1",
    formName: "Chemistry - Local Lab Results",
    labCategory: "CHEMISTRY",
    labName: "",
    labDate: "2025-10-15",
    testName: "ALT",
    testDescription: "Alanine aminotransferase",
    issue: "Missing Lab name",
    actionFor: "Action for CRA",
  },
  {
    id: "LAB-002",
    subjectId: "SUB-003",
    siteId: "SITE-18",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "France",
    visitName: "W12D1",
    formName: "Hematology Panel",
    labCategory: "HEMATOLOGY",
    labName: "LabCorp Paris",
    labDate: "2025-11-01",
    testName: "HGB",
    testDescription: "Hemoglobin",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
  {
    id: "LAB-003",
    subjectId: "SUB-004",
    siteId: "SITE-18",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "France",
    visitName: "Cycle 5 Week 3",
    formName: "Chemistry - Local Lab Results",
    labCategory: "CHEMISTRY",
    labName: "Central Lab",
    labDate: "2025-10-20",
    testName: "CK",
    testDescription: "Creatine Kinase",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
  {
    id: "LAB-004",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    visitName: "W20D1",
    formName: "Coagulation Panel",
    labCategory: "COAGULATION",
    labName: "Quest Diagnostics",
    labDate: "2025-10-25",
    testName: "PT",
    testDescription: "Prothrombin Time",
    issue: "Ranges/Units not entered",
    actionFor: "Action for CRA",
  },
  {
    id: "LAB-005",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    visitName: "W24D1",
    formName: "Chemistry - Local Lab Results",
    labCategory: "CHEMISTRY",
    labName: "",
    labDate: "2025-11-05",
    testName: "AST",
    testDescription: "Aspartate aminotransferase",
    issue: "Missing Lab name",
    actionFor: "Action for CRA",
  },
  {
    id: "LAB-006",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    visitName: "W24D1",
    formName: "Urinalysis",
    labCategory: "URINALYSIS",
    labName: "Boston Lab Services",
    labDate: "2025-11-05",
    testName: "PROT",
    testDescription: "Protein in Urine",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
  {
    id: "LAB-007",
    subjectId: "SUB-010",
    siteId: "SITE-42",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Brazil",
    visitName: "W12D1",
    formName: "Hematology Panel",
    labCategory: "HEMATOLOGY",
    labName: "",
    labDate: "2025-10-10",
    testName: "WBC",
    testDescription: "White Blood Cell Count",
    issue: "Missing Lab name",
    actionFor: "Action for CRA",
  },
  {
    id: "LAB-008",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "South Korea",
    visitName: "W4D1",
    formName: "Chemistry - Local Lab Results",
    labCategory: "CHEMISTRY",
    labName: "Seoul Central Lab",
    labDate: "2025-09-28",
    testName: "BUN",
    testDescription: "Blood Urea Nitrogen",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
  {
    id: "LAB-009",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "South Korea",
    visitName: "W8D1",
    formName: "Hematology Panel",
    labCategory: "HEMATOLOGY",
    labName: "Seoul Central Lab",
    labDate: "2025-10-15",
    testName: "PLT",
    testDescription: "Platelet Count",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
  {
    id: "LAB-010",
    subjectId: "SUB-014",
    siteId: "SITE-65",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "China",
    visitName: "W8D1",
    formName: "Chemistry - Local Lab Results",
    labCategory: "CHEMISTRY",
    labName: "Shanghai Medical Lab",
    labDate: "2025-10-08",
    testName: "CREAT",
    testDescription: "Creatinine",
    issue: "Ranges/Units not entered",
    actionFor: "Action for Site",
  },
];

// ============================================
// FILE 4: SAE Dashboard - Serious Adverse Events
// ============================================
export const saeRecords: SAERecord[] = [
  {
    id: "SAE-001",
    discrepancyId: "SAE-2025-001",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    country: "USA",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Hospitalization - Cardiac Event",
    createdTimestamp: "2025-11-14T09:23:45Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "Action taken",
    safetyReviewStatus: "Pending for Review",
    safetyActionStatus: "Pending",
    caseStatus: "Open",
  },
  {
    id: "SAE-002",
    discrepancyId: "SAE-2025-002",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    country: "USA",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Hospitalization - Infection",
    createdTimestamp: "2025-10-28T14:15:22Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "No action required",
    safetyReviewStatus: "Review Completed",
    safetyActionStatus: "Action taken",
    caseStatus: "Closed",
  },
  {
    id: "SAE-003",
    discrepancyId: "SAE-2025-003",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    country: "USA",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Life-Threatening Event",
    createdTimestamp: "2025-11-10T11:45:00Z",
    dmReviewStatus: "Pending for Review",
    dmActionStatus: "Pending",
    safetyReviewStatus: "Pending for Review",
    safetyActionStatus: "Pending",
    caseStatus: "Open",
  },
  {
    id: "SAE-004",
    discrepancyId: "SAE-2025-004",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    country: "USA",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Hospitalization - Surgery",
    createdTimestamp: "2025-09-20T08:30:15Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "Action taken",
    safetyReviewStatus: "Review Completed",
    safetyActionStatus: "Action taken",
    caseStatus: "Locked",
  },
  {
    id: "SAE-005",
    discrepancyId: "SAE-2025-005",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-010",
    siteId: "SITE-42",
    country: "Brazil",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Disability",
    createdTimestamp: "2025-11-01T16:20:30Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "Action taken",
    safetyReviewStatus: "Pending for Review",
    safetyActionStatus: "Pending",
    caseStatus: "Open",
  },
  {
    id: "SAE-006",
    discrepancyId: "SAE-2025-006",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-010",
    siteId: "SITE-42",
    country: "Brazil",
    region: "AMERICA",
    formName: "Serious Adverse Event Report",
    event: "Hospitalization - Adverse Reaction",
    createdTimestamp: "2025-10-15T10:00:00Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "No action required",
    safetyReviewStatus: "Review Completed",
    safetyActionStatus: "No action required",
    caseStatus: "Closed",
  },
  {
    id: "SAE-007",
    discrepancyId: "SAE-2025-007",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    country: "South Korea",
    region: "ASIA",
    formName: "Serious Adverse Event Report",
    event: "Hospitalization - Pneumonia",
    createdTimestamp: "2025-11-08T13:45:22Z",
    dmReviewStatus: "Pending for Review",
    dmActionStatus: "Pending",
    safetyReviewStatus: "Pending for Review",
    safetyActionStatus: "Pending",
    caseStatus: "Open",
  },
  {
    id: "SAE-008",
    discrepancyId: "SAE-2025-008",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-015",
    siteId: "SITE-70",
    country: "Singapore",
    region: "ASIA",
    formName: "Serious Adverse Event Report",
    event: "Death",
    createdTimestamp: "2025-10-05T07:15:00Z",
    dmReviewStatus: "Review Completed",
    dmActionStatus: "Action taken",
    safetyReviewStatus: "Review Completed",
    safetyActionStatus: "Action taken",
    caseStatus: "Closed",
  },
];

// ============================================
// FILE 5: Inactivated Forms and Loglines
// ============================================
export const inactivatedForms: InactivatedForm[] = [
  {
    id: "IF-001",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Spain",
    siteNumber: "014",
    folder: "Lab Results",
    formName: "Chemistry Panel",
    hasData: false,
    recordPosition: 1,
    auditAction: "DataPage inactivated with code reason: Not Done",
    reason: "Not Done",
  },
  {
    id: "IF-002",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Spain",
    siteNumber: "014",
    folder: "Vital Signs",
    formName: "Blood Pressure",
    hasData: true,
    recordPosition: 2,
    auditAction: "DataPage inactivated with code reason: Duplicate Entry",
    reason: "Duplicate Entry",
  },
  {
    id: "IF-003",
    subjectId: "SUB-005",
    siteId: "SITE-05",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Austria",
    siteNumber: "005",
    folder: "Adverse Events",
    formName: "AE Form",
    hasData: false,
    recordPosition: 1,
    auditAction: "DataPage inactivated with code reason: Not Applicable",
    reason: "Not Applicable",
  },
  {
    id: "IF-004",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    siteNumber: "027",
    folder: "Disposition",
    formName: "Discontinuation Form",
    hasData: true,
    recordPosition: 1,
    auditAction: "Record Inactivated: Data Entered in Error",
    reason: "Data Entered in Error",
  },
  {
    id: "IF-005",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "USA",
    siteNumber: "031",
    folder: "Concomitant Medications",
    formName: "Prior Medications",
    hasData: true,
    recordPosition: 3,
    auditAction: "DataPage inactivated with code reason: Duplicate Entry",
    reason: "Duplicate Entry",
  },
  {
    id: "IF-006",
    subjectId: "SUB-015",
    siteId: "SITE-70",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    country: "Singapore",
    siteNumber: "070",
    folder: "All",
    formName: "Multiple Forms",
    hasData: false,
    recordPosition: 1,
    auditAction: "Record Inactivated: Subject Withdrew",
    reason: "Subject Withdrew",
  },
];

// ============================================
// FILE 6: Global Missing Pages Report
// ============================================
export const missingPages: MissingPage[] = [
  {
    id: "MP-001",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    country: "Spain",
    region: "EMEA",
    overallStatus: "Discontinued",
    visitLevelStatus: "On Trial",
    folderName: "Vital Signs",
    visitDate: "2025-10-01",
    formType: "Visit",
    formName: "Blood Pressure Form",
    daysMissing: 45,
  },
  {
    id: "MP-002",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    country: "Spain",
    region: "EMEA",
    overallStatus: "Discontinued",
    visitLevelStatus: "On Trial",
    folderName: "Lab Results",
    visitDate: "2025-10-08",
    formType: "Visit",
    formName: "Chemistry Panel",
    daysMissing: 38,
  },
  {
    id: "MP-003",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-003",
    siteId: "SITE-18",
    country: "France",
    region: "EMEA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "ECG",
    visitDate: "2025-11-01",
    formType: "Visit",
    formName: "12-Lead ECG",
    daysMissing: 15,
  },
  {
    id: "MP-004",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-004",
    siteId: "SITE-18",
    country: "France",
    region: "EMEA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Physical Exam",
    visitDate: "2025-10-20",
    formType: "Visit",
    formName: "Physical Examination",
    daysMissing: 27,
  },
  {
    id: "MP-005",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-005",
    siteId: "SITE-05",
    country: "Austria",
    region: "EMEA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Vital Signs",
    visitDate: "2025-09-15",
    formType: "Visit",
    formName: "Weight Measurement",
    daysMissing: 62,
  },
  {
    id: "MP-006",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    country: "USA",
    region: "AMERICA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Adverse Events",
    visitDate: "2025-10-28",
    formType: "Visit",
    formName: "AE Assessment",
    daysMissing: 19,
  },
  {
    id: "MP-007",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    country: "USA",
    region: "AMERICA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Lab Results",
    visitDate: "2025-10-15",
    formType: "Visit",
    formName: "Hematology Panel",
    daysMissing: 32,
  },
  {
    id: "MP-008",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-010",
    siteId: "SITE-42",
    country: "Brazil",
    region: "AMERICA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Concomitant Medications",
    visitDate: "2025-11-05",
    formType: "Visit",
    formName: "Medication Log",
    daysMissing: 11,
  },
  {
    id: "MP-009",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    country: "South Korea",
    region: "ASIA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "ECG",
    visitDate: "2025-10-22",
    formType: "Visit",
    formName: "12-Lead ECG",
    daysMissing: 25,
  },
  {
    id: "MP-010",
    studyId: "STUDY-01",
    studyName: "Study 1",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-014",
    siteId: "SITE-65",
    country: "China",
    region: "ASIA",
    overallStatus: "On Trial",
    visitLevelStatus: "On Trial",
    folderName: "Physical Exam",
    visitDate: "2025-11-08",
    formType: "Visit",
    formName: "Neurological Assessment",
    daysMissing: 8,
  },
];

// ============================================
// FILE 7: Compiled EDRR
// ============================================
export const edrrIssues: EDRRIssue[] = [
  {
    id: "EDRR-001",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-008",
    siteId: "SITE-27",
    totalOpenIssues: 1,
  },
  {
    id: "EDRR-002",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    totalOpenIssues: 2,
  },
  {
    id: "EDRR-003",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    totalOpenIssues: 1,
  },
];

// ============================================
// FILE 8: MedDRA Coding Report
// ============================================
export const meddraCoding: MedDRACoding[] = [
  {
    id: "MD-001",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-001",
    siteId: "SITE-14",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Abdominal Pain",
    supplementTerm: "severe",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-002",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-001",
    siteId: "SITE-14",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Medical History",
    formOID: "FORM_MH_001",
    logline: 1,
    fieldOID: "MHTERM",
    term: "Hypertension",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-003",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Headache",
    supplementTerm: "mild",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "MD-004",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 2,
    fieldOID: "AETERM",
    term: "Nausea",
    supplementTerm: "",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "MD-005",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Medical History",
    formOID: "FORM_MH_001",
    logline: 1,
    fieldOID: "MHTERM",
    term: "Diabetes Type 2",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-006",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-004",
    siteId: "SITE-18",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Fatigue",
    supplementTerm: "moderate",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-007",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-004",
    siteId: "SITE-18",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 2,
    fieldOID: "AETERM",
    term: "Dizziness",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-008",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Chest Pain",
    supplementTerm: "severe",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "MD-009",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Medical History",
    formOID: "FORM_MH_001",
    logline: 1,
    fieldOID: "MHTERM",
    term: "Previous MI",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-010",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Rash",
    supplementTerm: "itchy",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-011",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 2,
    fieldOID: "AETERM",
    term: "Joint Pain",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-012",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-013",
    siteId: "SITE-60",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Cough",
    supplementTerm: "persistent",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-013",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-014",
    siteId: "SITE-65",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Adverse Events",
    formOID: "FORM_AE_001",
    logline: 1,
    fieldOID: "AETERM",
    term: "Insomnia",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "MD-014",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-014",
    siteId: "SITE-65",
    dictionary: "MedDRA",
    dictionaryVersion: "v28.1",
    formName: "Medical History",
    formOID: "FORM_MH_001",
    logline: 1,
    fieldOID: "MHTERM",
    term: "Anxiety",
    supplementTerm: "",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
];

// ============================================
// FILE 9: WHODrug Coding Report
// ============================================
export const whodrugCoding: WHODrugCoding[] = [
  {
    id: "WD-001",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-002",
    siteId: "SITE-14",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Metformin",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-002",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-003",
    siteId: "SITE-18",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Lisinopril",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-003",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-004",
    siteId: "SITE-18",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Aspirin",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-004",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Antineoplastic Medications",
    formOID: "FORM_AN_001",
    logline: 1,
    fieldOID: "ANTRT",
    tradeName: "Pembrolizumab",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-005",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-007",
    siteId: "SITE-27",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Atorvastatin",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-006",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-009",
    siteId: "SITE-31",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Unknown Med",
    codingStatus: "UnCoded Term",
    requireCoding: true,
  },
  {
    id: "WD-007",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-011",
    siteId: "SITE-55",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Omeprazole",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
  {
    id: "WD-008",
    studyId: "STUDY-01",
    projectName: "Oncology Phase III - Study 1",
    subjectId: "SUB-012",
    siteId: "SITE-55",
    dictionary: "WHODrug-Global-B3",
    dictionaryVersion: "v202509",
    formName: "Prior or Concomitant Medications",
    formOID: "FORM_CM_001",
    logline: 1,
    fieldOID: "CMTRT",
    tradeName: "Amlodipine",
    codingStatus: "Coded Term",
    requireCoding: false,
  },
];

// ============================================
// HELPER FUNCTIONS FOR UI
// ============================================

// Get all unique regions
export const getRegions = (): Region[] => {
  return ["EMEA", "ASIA", "AMERICA"];
};

// Get all unique countries
export const getCountries = (region?: Region | "ALL"): string[] => {
  const filtered =
    region && region !== "ALL"
      ? masterMetrics.filter((m) => m.region === region)
      : masterMetrics;
  return [...new Set(filtered.map((m) => m.country))].sort();
};

// Get all unique sites
export const getSites = (
  country?: string | "ALL",
  region?: Region | "ALL",
): { siteId: string; siteName: string; country: string }[] => {
  let filtered = masterMetrics;
  if (region && region !== "ALL") {
    filtered = filtered.filter((m) => m.region === region);
  }
  if (country && country !== "ALL") {
    filtered = filtered.filter((m) => m.country === country);
  }
  const sites = new Map<
    string,
    { siteId: string; siteName: string; country: string }
  >();
  filtered.forEach((m) => {
    if (!sites.has(m.siteId)) {
      sites.set(m.siteId, {
        siteId: m.siteId,
        siteName: m.siteName,
        country: m.country,
      });
    }
  });
  return Array.from(sites.values()).sort((a, b) =>
    a.siteId.localeCompare(b.siteId),
  );
};

// Get all subjects for a site
export const getSubjects = (siteId?: string | "ALL"): string[] => {
  const filtered =
    siteId && siteId !== "ALL"
      ? masterMetrics.filter((m) => m.siteId === siteId)
      : masterMetrics;
  return filtered.map((m) => m.subjectId).sort();
};

// Filter master metrics based on filters
export const filterMetrics = (filters: FilterState): SubjectMetric[] => {
  let result = masterMetrics;
  if (filters.region !== "ALL") {
    result = result.filter((m) => m.region === filters.region);
  }
  if (filters.country !== "ALL") {
    result = result.filter((m) => m.country === filters.country);
  }
  if (filters.siteId !== "ALL") {
    result = result.filter((m) => m.siteId === filters.siteId);
  }
  if (filters.subjectId !== "ALL") {
    result = result.filter((m) => m.subjectId === filters.subjectId);
  }
  return result;
};

// Get KPI summary
export const getKPISummary = (filters: FilterState): KPISummary => {
  const filtered = filterMetrics(filters);
  return {
    totalMissingVisits: filtered.reduce((acc, m) => acc + m.missingVisits, 0),
    openQueries: filtered.reduce((acc, m) => acc + m.totalQueries, 0),
    seriousAdverseEvents: saeRecords.filter(
      (s) =>
        (filters.region === "ALL" || s.region === filters.region) &&
        (filters.siteId === "ALL" || s.siteId === filters.siteId) &&
        s.caseStatus === "Open",
    ).length,
    uncodedTerms: filtered.reduce((acc, m) => acc + m.uncodedTerms, 0),
  };
};

// Get stats by region for stacked bar chart
export const getStatsByRegion = (): RegionChartData[] => {
  const regions: Region[] = ["EMEA", "ASIA", "AMERICA"];
  return regions.map((reg) => {
    const regionMetrics = masterMetrics.filter((m) => m.region === reg);
    const totalPages = regionMetrics.reduce(
      (acc, m) => acc + m.pagesEntered,
      0,
    );
    const missingPages = regionMetrics.reduce(
      (acc, m) => acc + m.missingPages,
      0,
    );
    return {
      name: reg,
      missingPages,
      completedPages: totalPages,
      queries: regionMetrics.reduce((acc, m) => acc + m.totalQueries, 0),
      totalSubjects: regionMetrics.length,
    };
  });
};

// Get site performance data for composed chart
export const getSitePerformance = (
  filters: FilterState,
): SitePerformanceData[] => {
  const siteMap = new Map<string, SubjectMetric[]>();

  let filtered = masterMetrics;
  if (filters.region !== "ALL") {
    filtered = filtered.filter((m) => m.region === filters.region);
  }
  if (filters.country !== "ALL") {
    filtered = filtered.filter((m) => m.country === filters.country);
  }

  filtered.forEach((m) => {
    const existing = siteMap.get(m.siteId) || [];
    existing.push(m);
    siteMap.set(m.siteId, existing);
  });

  const result: SitePerformanceData[] = [];
  siteMap.forEach((metrics, siteId) => {
    const openQueries = metrics.reduce((acc, m) => acc + m.totalQueries, 0);
    const missingVisits = missingVisitsDetail.filter(
      (mv) => mv.siteId === siteId,
    );
    const avgDays =
      missingVisits.length > 0
        ? Math.round(
            missingVisits.reduce((acc, mv) => acc + mv.daysOutstanding, 0) /
              missingVisits.length,
          )
        : 0;
    const signatureBacklog = metrics.reduce(
      (acc, m) => acc + m.crfsOverdue90Days,
      0,
    );
    const totalExpected = metrics.reduce(
      (acc, m) => acc + m.expectedVisits * 15,
      0,
    ); // Assume 15 pages per visit
    const totalMissing = metrics.reduce(
      (acc, m) => acc + m.missingPages + m.totalQueries,
      0,
    );
    const dataQuality =
      totalExpected > 0
        ? Math.round((1 - totalMissing / totalExpected) * 100)
        : 100;

    result.push({
      siteId,
      siteName: metrics[0].siteName,
      country: metrics[0].country,
      region: metrics[0].region,
      openQueries,
      avgDaysOutstanding: avgDays,
      signatureBacklog,
      dataQualityScore: Math.max(0, Math.min(100, dataQuality)),
      subjectCount: metrics.length,
    });
  });

  return result.sort((a, b) => b.signatureBacklog - a.signatureBacklog);
};

// Get SAE chart data (donut)
export const getSAEChartData = (filters: FilterState): SAEChartData[] => {
  let filtered = saeRecords;
  if (filters.region !== "ALL") {
    filtered = filtered.filter((s) => s.region === filters.region);
  }
  if (filters.siteId !== "ALL") {
    filtered = filtered.filter((s) => s.siteId === filters.siteId);
  }

  const open = filtered.filter((s) => s.caseStatus === "Open").length;
  const closed = filtered.filter((s) => s.caseStatus === "Closed").length;
  const locked = filtered.filter((s) => s.caseStatus === "Locked").length;

  return [
    { name: "Open", value: open, color: "#E57373" },
    { name: "Closed", value: closed, color: "#3CB371" },
    { name: "Locked", value: locked, color: "#7B74D1" },
  ];
};

// Get patient visit timeline
export const getPatientVisitTimeline = (
  subjectId: string,
): PatientVisitData[] => {
  const subject = masterMetrics.find((m) => m.subjectId === subjectId);
  if (!subject) return [];

  const missingForSubject = missingVisitsDetail.filter(
    (mv) => mv.subjectId === subjectId,
  );
  const missingVisitNames = new Set(
    missingForSubject.map((mv) => mv.visitName),
  );

  // Define expected visits based on subject's expected visits count
  const visits: PatientVisitData[] = [
    {
      visitName: "Screening",
      projectedDate: "2025-01-15",
      status: "Completed",
    },
    { visitName: "W1D1", projectedDate: "2025-01-22", status: "Completed" },
    { visitName: "W1D3", projectedDate: "2025-01-24", status: "Completed" },
    { visitName: "W2D1", projectedDate: "2025-01-29", status: "Completed" },
    { visitName: "W4D1", projectedDate: "2025-02-12", status: "Completed" },
    { visitName: "W8D1", projectedDate: "2025-03-12", status: "Completed" },
    { visitName: "W12D1", projectedDate: "2025-04-09", status: "Completed" },
    {
      visitName: "Week 7 Visit",
      projectedDate: "2025-05-01",
      status: "Completed",
    },
    {
      visitName: "Cycle 5 Week 2",
      projectedDate: "2025-06-15",
      status: "Completed",
    },
    {
      visitName: "Cycle 8 Week 2",
      projectedDate: "2025-08-01",
      status: "Completed",
    },
    {
      visitName: "Cycle 12 Week 1",
      projectedDate: "2025-10-15",
      status: "Completed",
    },
    {
      visitName: "30 Day Follow-Up",
      projectedDate: "2025-11-15",
      status: "Upcoming",
    },
    {
      visitName: "Follow-up Week 52",
      projectedDate: "2026-01-15",
      status: "Upcoming",
    },
    {
      visitName: "Follow-up Week 104",
      projectedDate: "2027-01-15",
      status: "Upcoming",
    },
  ];

  // Mark missing visits
  return visits.map((v) => {
    if (missingVisitNames.has(v.visitName)) {
      const missing = missingForSubject.find(
        (mv) => mv.visitName === v.visitName,
      );
      return {
        ...v,
        status: "Missing" as const,
        daysOutstanding: missing?.daysOutstanding,
      };
    }
    return v;
  });
};

// Get coding category data for treemap
export const getCodingCategoryData = (): CodingCategoryData[] => {
  const categories = [
    { name: "Adverse Events", color: "#E57373" },
    { name: "Medical History", color: "#7B74D1" },
    { name: "Medications", color: "#8ED9E2" },
    { name: "Prior Medications", color: "#3CB371" },
  ];

  return categories
    .map((cat) => {
      const meddraItems = meddraCoding.filter((m) =>
        m.formName.includes(cat.name.split(" ")[0]),
      );
      const whodrugItems = cat.name.includes("Medication") ? whodrugCoding : [];

      const allItems = [...meddraItems, ...whodrugItems];
      const coded = allItems.filter(
        (i) => i.codingStatus === "Coded Term",
      ).length;
      const uncoded = allItems.filter(
        (i) => i.codingStatus === "UnCoded Term",
      ).length;

      return {
        name: cat.name,
        size: coded + uncoded,
        coded,
        uncoded,
        color: cat.color,
      };
    })
    .filter((c) => c.size > 0);
};

// Get country performance for composed chart
export const getCountryPerformance = (
  filters: FilterState,
): { country: string; openQueries: number; avgDaysOutstanding: number }[] => {
  const countryMap = new Map<string, SubjectMetric[]>();

  let filtered = masterMetrics;
  if (filters.region !== "ALL") {
    filtered = filtered.filter((m) => m.region === filters.region);
  }

  filtered.forEach((m) => {
    const existing = countryMap.get(m.country) || [];
    existing.push(m);
    countryMap.set(m.country, existing);
  });

  const result: {
    country: string;
    openQueries: number;
    avgDaysOutstanding: number;
  }[] = [];
  countryMap.forEach((metrics, country) => {
    const openQueries = metrics.reduce((acc, m) => acc + m.totalQueries, 0);
    const missingVisits = missingVisitsDetail.filter(
      (mv) => mv.country === country,
    );
    const avgDays =
      missingVisits.length > 0
        ? Math.round(
            missingVisits.reduce((acc, mv) => acc + mv.daysOutstanding, 0) /
              missingVisits.length,
          )
        : 0;

    result.push({ country, openQueries, avgDaysOutstanding: avgDays });
  });

  return result.sort((a, b) => b.openQueries - a.openQueries);
};

// Get subject details for patient 360 view
export const getSubjectDetails = (subjectId: string) => {
  const subject = masterMetrics.find((m) => m.subjectId === subjectId);
  if (!subject) return null;

  const visits = getPatientVisitTimeline(subjectId);
  const missingVisits = missingVisitsDetail.filter(
    (mv) => mv.subjectId === subjectId,
  );
  const labs = labIssues.filter((l) => l.subjectId === subjectId);
  const saes = saeRecords.filter((s) => s.subjectId === subjectId);
  const meddra = meddraCoding.filter((m) => m.subjectId === subjectId);
  const whodrug = whodrugCoding.filter((w) => w.subjectId === subjectId);
  const pages = missingPages.filter((p) => p.subjectId === subjectId);

  return {
    subject,
    visits,
    missingVisits,
    labs,
    saes,
    meddra,
    whodrug,
    missingPages: pages,
    dataQualityScore: calculateDataQuality(subject),
  };
};

// Calculate data quality score using the formula
export const calculateDataQuality = (subject: SubjectMetric): number => {
  const totalExpectedPages = subject.expectedVisits * 15; // Assume 15 pages per visit
  if (totalExpectedPages === 0) return 100;

  const score =
    (1 - (subject.totalQueries + subject.missingPages) / totalExpectedPages) *
    100;
  return Math.max(0, Math.min(100, Math.round(score)));
};

// Get unique studies for study filter dropdown
export const getStudies = (): Array<{
  studyId: string;
  projectName: string;
}> => {
  const studyMap = new Map<string, string>();

  masterMetrics.forEach((m) => {
    if (!studyMap.has(m.studyId)) {
      studyMap.set(m.studyId, m.projectName);
    }
  });

  return Array.from(studyMap.entries())
    .map(([studyId, projectName]) => ({ studyId, projectName }))
    .sort((a, b) => a.studyId.localeCompare(b.studyId));
};
