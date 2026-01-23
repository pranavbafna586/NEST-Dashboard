"use client";

import React from "react";
import { SubjectMetric, PatientVisitData, LabIssue, SAERecord } from "@/types";
import PatientVisitTimeline from "../charts/PatientVisitTimeline";

interface Patient360Props {
  subject: SubjectMetric;
  visits: PatientVisitData[];
  missingVisits: Array<{ visitName: string; daysOutstanding: number }>;
  labs: LabIssue[];
  saes: SAERecord[];
  dataQualityScore: number;
  onClose: () => void;
}

export default function Patient360({
  subject,
  visits,
  missingVisits,
  labs,
  saes,
  dataQualityScore,
  onClose,
}: Patient360Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
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
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Data Quality
              </p>
              <div className="flex items-end gap-2">
                <span
                  className={`text-2xl font-bold ${
                    dataQualityScore >= 90
                      ? "text-emerald-600"
                      : dataQualityScore >= 75
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {dataQualityScore}%
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      dataQualityScore >= 90
                        ? "bg-emerald-500"
                        : dataQualityScore >= 75
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${dataQualityScore}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Latest Visit
              </p>
              <p className="text-lg font-bold text-gray-900">
                {subject.latestVisit}
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Open Queries
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
          </div>

          {/* Visit Timeline */}
          <PatientVisitTimeline data={visits} subjectId={subject.subjectId} />

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missing Visits Detail */}
            {missingVisits.length > 0 && (
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Missing Visits Detail
                </h3>
                <div className="space-y-3">
                  {missingVisits.map((mv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">
                        {mv.visitName}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          mv.daysOutstanding > 30
                            ? "bg-red-100 text-red-700"
                            : mv.daysOutstanding > 15
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {mv.daysOutstanding} days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Issues */}
            {labs.length > 0 && (
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
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  Lab Issues
                </h3>
                <div className="space-y-3">
                  {labs.map((lab, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {lab.testName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                          {lab.labCategory}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {lab.testDescription}
                      </p>
                      <p className="text-xs text-red-600">{lab.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SAEs */}
            {saes.length > 0 && (
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Serious Adverse Events
                </h3>
                <div className="space-y-3">
                  {saes.map((sae, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {sae.event}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
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
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">DM Review:</span>
                          <span
                            className={`ml-1 ${
                              sae.dmReviewStatus === "Review Completed"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {sae.dmReviewStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Safety Review:</span>
                          <span
                            className={`ml-1 ${
                              sae.safetyReviewStatus === "Review Completed"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {sae.safetyReviewStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query Breakdown */}
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
                Query Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {subject.queriesDM > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Data Management</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesDM}
                    </p>
                  </div>
                )}
                {subject.queriesClinical > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Clinical</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesClinical}
                    </p>
                  </div>
                )}
                {subject.queriesMedical > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Medical</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesMedical}
                    </p>
                  </div>
                )}
                {subject.queriesSite > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Site</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesSite}
                    </p>
                  </div>
                )}
                {subject.queriesFieldMonitor > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Field Monitor</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesFieldMonitor}
                    </p>
                  </div>
                )}
                {subject.queriesCoding > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Coding</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subject.queriesCoding}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Pages Entered
              </p>
              <p className="text-xl font-bold text-gray-900">
                {subject.pagesEntered}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                CRFs Signed
              </p>
              <p className="text-xl font-bold text-gray-900">
                {subject.crfsSigned}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Overdue 90 Days
              </p>
              <p
                className={`text-xl font-bold ${subject.crfsOverdue90Days > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {subject.crfsOverdue90Days}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                Uncoded Terms
              </p>
              <p
                className={`text-xl font-bold ${subject.uncodedTerms > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {subject.uncodedTerms}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
