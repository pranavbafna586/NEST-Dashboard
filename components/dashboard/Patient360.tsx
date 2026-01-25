"use client";

import React from "react";

interface Patient360Props {
  data: {
    subject: {
      subjectId: string;
      siteId: string;
      siteName: string;
      country: string;
      region: string;
      projectName: string;
      status: string;
      latestVisit: string;
      isHighRisk: boolean;
      totalQueries: number;
      missingVisits: number;
      missingPages: number;
      pagesEntered: number;
      expectedVisits: number;
    };
    visitSummary: {
      completedVisits: number;
      missingVisits: number;
      upcomingVisits: number;
      recentVisits: Array<{
        visitName: string;
        visitDate: string;
        status: string;
      }>;
    };
    criticalMissingVisits: Array<{
      visitName: string;
      daysOutstanding: number;
      projectedDate: string;
    }>;
    queries: {
      total: number;
      byType: {
        dmQueries: number;
        clinicalQueries: number;
        medicalQueries: number;
        siteQueries: number;
        fieldMonitorQueries: number;
        codingQueries: number;
        safetyQueries: number;
      };
      openQueryDetails?: Array<{
        formName: string;
        visitName: string;
        markingGroupName: string;
        queryStatus: string;
        actionOwner: string;
        daysOpen: number;
      }>;
    };
    safetyIssues: {
      totalSAEs: number;
      openSAEs: number;
      saesByStatus: {
        open: number;
        closed: number;
        locked: number;
      };
      recentSAEs: Array<{
        discrepancyId: string;
        formName: string;
        caseStatus: string;
        reviewStatus: string;
        actionStatus: string;
        responsibleLF: string;
        createdTimestamp: string;
      }>;
    };
    dataQuality: {
      score: number;
      nonConformantPages: number;
      openLabIssues: number;
      openEDRRIssues: number;
      uncodedTerms: number;
    };
    complianceStatus: {
      formsRequireVerification: number;
      formsVerified: number;
      crfsOverdue90Days: number;
      crfsOverdue45to90Days: number;
      brokenSignatures: number;
      crfsNeverSigned: number;
      pdsConfirmed: number;
      pdsProposed: number;
    };
    formStatus: {
      frozen: number;
      locked: number;
      unlocked: number;
    };
  };
  onClose: () => void;
}

export default function Patient360({ data, onClose }: Patient360Props) {
  const {
    subject,
    visitSummary,
    criticalMissingVisits,
    queries,
    safetyIssues,
    dataQuality,
    complianceStatus,
    formStatus,
  } = data;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {subject.subjectId}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subject.status === "On Trial"
                        ? "bg-emerald-100 text-emerald-700"
                        : subject.status === "Discontinued"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {subject.status}
                  </span>
                  {subject.isHighRisk && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      High Risk
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {subject.siteName} • {subject.country} • {subject.region}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/80 bg-white/60 text-gray-700 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Data Quality
              </p>
              <div className="flex items-end gap-2">
                <span
                  className={`text-2xl font-bold ${
                    dataQuality.score >= 90
                      ? "text-emerald-600"
                      : dataQuality.score >= 75
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {dataQuality.score}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Pages Entered
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {subject.pagesEntered}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Total Queries
              </p>
              <p
                className={`text-2xl font-bold ${
                  subject.totalQueries > 20
                    ? "text-red-600"
                    : subject.totalQueries > 0
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {subject.totalQueries}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Completed Visits
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {visitSummary.completedVisits}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Missing Visits
              </p>
              <p
                className={`text-2xl font-bold ${subject.missingVisits > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {subject.missingVisits}
              </p>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Recent Visits (Last 5)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {visitSummary.recentVisits.map((visit, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border border-gray-200 text-center"
                >
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {visit.visitName}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">✓ Completed</p>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Missing Visits */}
          {criticalMissingVisits.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Critical Missing Visits (&gt;30 Days Overdue)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalMissingVisits.map((mv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {mv.visitName}
                      </p>
                      <p className="text-xs text-gray-600">
                        Due: {mv.projectedDate}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                      {mv.daysOutstanding} days
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Queries Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Queries by Type (Total: {queries.total})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "DM", value: queries.byType.dmQueries, color: "blue" },
                {
                  label: "Clinical",
                  value: queries.byType.clinicalQueries,
                  color: "purple",
                },
                {
                  label: "Medical",
                  value: queries.byType.medicalQueries,
                  color: "pink",
                },
                {
                  label: "Site",
                  value: queries.byType.siteQueries,
                  color: "amber",
                },
                {
                  label: "Field Monitor",
                  value: queries.byType.fieldMonitorQueries,
                  color: "cyan",
                },
                {
                  label: "Coding",
                  value: queries.byType.codingQueries,
                  color: "indigo",
                },
                {
                  label: "Safety",
                  value: queries.byType.safetyQueries,
                  color: "red",
                },
              ].map((q, i) => (
                <div
                  key={i}
                  className={`p-3 bg-white rounded-lg border border-${q.color}-200`}
                >
                  <p className="text-xs text-gray-600">{q.label}</p>
                  <p className={`text-2xl font-bold text-${q.color}-600`}>
                    {q.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Open Query Details */}
            {queries.openQueryDetails &&
              queries.openQueryDetails.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Recent Open Queries
                  </h4>
                  <div className="space-y-2">
                    {queries.openQueryDetails.slice(0, 5).map((query, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-gray-200 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {query.formName}
                          </span>
                          <span className="text-red-600 font-medium">
                            {query.daysOpen} days open
                          </span>
                        </div>
                        <p className="text-gray-600">
                          Visit: {query.visitName} | Type:{" "}
                          {query.markingGroupName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Safety Issues (SAEs) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Safety Issues (SAEs) - Total: {safetyIssues.totalSAEs}
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-white rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">Open SAEs</p>
                <p className="text-2xl font-bold text-red-600">
                  {safetyIssues.openSAEs}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-200">
                <p className="text-xs text-gray-600">Closed SAEs</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {safetyIssues.saesByStatus.closed}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">Locked SAEs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {safetyIssues.saesByStatus.locked}
                </p>
              </div>
            </div>
            {safetyIssues.recentSAEs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Recent SAEs
                </h4>
                <div className="space-y-3">
                  {safetyIssues.recentSAEs.slice(0, 5).map((sae, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          ID: {sae.discrepancyId}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            sae.caseStatus === "Open"
                              ? "bg-red-100 text-red-700"
                              : sae.caseStatus === "Closed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {sae.caseStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Form: {sae.formName}
                      </p>
                      <p className="text-xs text-gray-600">
                        Responsible: {sae.responsibleLF} | Status:{" "}
                        {sae.actionStatus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Quality & Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Quality Issues */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Data Quality Issues
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Non-Conformant Pages",
                    value: dataQuality.nonConformantPages,
                  },
                  {
                    label: "Open Lab Issues",
                    value: dataQuality.openLabIssues,
                  },
                  {
                    label: "Open EDRR Issues",
                    value: dataQuality.openEDRRIssues,
                  },
                  { label: "Uncoded Terms", value: dataQuality.uncodedTerms },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span
                      className={`text-lg font-bold ${
                        item.value > 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Compliance & Verification
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Forms Need Verification",
                    value: complianceStatus.formsRequireVerification,
                    warn: true,
                  },
                  {
                    label: "Forms Verified",
                    value: complianceStatus.formsVerified,
                    warn: false,
                  },
                  {
                    label: "CRFs Overdue >90 Days",
                    value: complianceStatus.crfsOverdue90Days,
                    warn: true,
                  },
                  {
                    label: "Broken Signatures",
                    value: complianceStatus.brokenSignatures,
                    warn: true,
                  },
                  {
                    label: "CRFs Never Signed",
                    value: complianceStatus.crfsNeverSigned,
                    warn: true,
                  },
                  {
                    label: "PDs Confirmed",
                    value: complianceStatus.pdsConfirmed,
                    warn: false,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span
                      className={`text-lg font-bold ${
                        item.warn && item.value > 0
                          ? "text-amber-600"
                          : "text-gray-900"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Form Lock Status
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                <p className="text-xs text-gray-600 mb-2">Frozen Forms</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formStatus.frozen}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                <p className="text-xs text-gray-600 mb-2">Locked Forms</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formStatus.locked}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                <p className="text-xs text-gray-600 mb-2">Unlocked Forms</p>
                <p className="text-2xl font-bold text-gray-600">
                  {formStatus.unlocked}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
