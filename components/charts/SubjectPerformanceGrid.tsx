"use client";

import React, { useState } from "react";

interface SubjectData {
  subject_id: string;
  latest_visit: string;
  subject_status: string;
  pages_entered: number;
  missing_page: number;
  total_queries: number;
  percentage_clean_crf: number;
  missing_visits: number;
  forms_verified: number;
}

interface SubjectPerformanceGridProps {
  data: SubjectData[];
  onSubjectClick?: (subjectId: string) => void;
}

export default function SubjectPerformanceGrid({
  data,
  onSubjectClick,
}: SubjectPerformanceGridProps) {
  const [sortColumn, setSortColumn] = useState<keyof SubjectData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle sorting
  const handleSort = (column: keyof SubjectData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active") || statusLower.includes("enrolled")) {
      return "bg-green-100 text-green-700";
    } else if (statusLower.includes("completed")) {
      return "bg-blue-100 text-blue-700";
    } else if (
      statusLower.includes("withdrawn") ||
      statusLower.includes("discontinued")
    ) {
      return "bg-red-100 text-red-700";
    } else {
      return "bg-gray-100 text-gray-700";
    }
  };

  // Get clean CRF color
  const getCleanCRFColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 font-semibold";
    if (percentage >= 50) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const SortIcon = ({ column }: { column: keyof SubjectData }) => {
    if (sortColumn !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col min-h-[600px] max-h-[600px]">
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          Subject Performance
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Detailed metrics for all subjects ({data.length} subjects)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                onClick={() => handleSort("subject_id")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Subject ID
                  <SortIcon column="subject_id" />
                </div>
              </th>
              <th
                onClick={() => handleSort("subject_status")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon column="subject_status" />
                </div>
              </th>
              <th
                onClick={() => handleSort("latest_visit")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Latest Visit
                  <SortIcon column="latest_visit" />
                </div>
              </th>
              <th
                onClick={() => handleSort("pages_entered")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Pages Entered
                  <SortIcon column="pages_entered" />
                </div>
              </th>
              <th
                onClick={() => handleSort("missing_page")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Missing
                  <SortIcon column="missing_page" />
                </div>
              </th>
              <th
                onClick={() => handleSort("total_queries")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Queries
                  <SortIcon column="total_queries" />
                </div>
              </th>
              <th
                onClick={() => handleSort("percentage_clean_crf")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Clean CRF %
                  <SortIcon column="percentage_clean_crf" />
                </div>
              </th>
              <th
                onClick={() => handleSort("missing_visits")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Missing Visits
                  <SortIcon column="missing_visits" />
                </div>
              </th>
              <th
                onClick={() => handleSort("forms_verified")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Verified
                  <SortIcon column="forms_verified" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((subject, index) => (
              <tr
                key={`${subject.subject_id}-${index}`}
                onClick={() => onSubjectClick?.(subject.subject_id)}
                className={`${
                  onSubjectClick ? "cursor-pointer hover:bg-blue-50" : ""
                } ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  {subject.subject_id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subject.subject_status)}`}
                  >
                    {subject.subject_status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {subject.latest_visit}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {subject.pages_entered.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                  {subject.missing_page.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-600 text-right font-medium">
                  {subject.total_queries.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm text-right ${getCleanCRFColor(subject.percentage_clean_crf)}`}
                >
                  {subject.percentage_clean_crf.toFixed(1)}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {subject.missing_visits}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {subject.forms_verified.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No subjects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
