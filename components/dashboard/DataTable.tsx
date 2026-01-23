"use client";

import React, { useState } from "react";
import { SitePerformanceData, SubjectMetric } from "@/types";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  title?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  title,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {title && (
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    column.sortable !== false
                      ? "cursor-pointer hover:text-gray-900 transition-colors"
                      : ""
                  }`}
                  onClick={() =>
                    column.sortable !== false && handleSort(String(column.key))
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && sortColumn === column.key && (
                      <span className="text-blue-400">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-5 py-4 text-sm text-slate-300"
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized Site Performance Table
interface SitePerformanceTableProps {
  data: SitePerformanceData[];
  onSiteClick?: (siteId: string) => void;
}

export function SitePerformanceTable({
  data,
  onSiteClick,
}: SitePerformanceTableProps) {
  return (
    <DataTable
      title="Site Performance - Signature Backlog"
      data={data}
      onRowClick={(row) => onSiteClick?.(row.siteId)}
      columns={[
        {
          key: "siteId",
          header: "Site",
          render: (_, row) => (
            <div>
              <div className="font-medium text-gray-900">{row.siteId}</div>
              <div className="text-xs text-gray-600">{row.country}</div>
            </div>
          ),
        },
        {
          key: "signatureBacklog",
          header: "Backlog (>90d)",
          render: (value) => (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                (value as number) > 10
                  ? "bg-red-100 text-red-700"
                  : (value as number) > 5
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {value as number}
              {(value as number) > 10 && (
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
              )}
            </span>
          ),
        },
        {
          key: "openQueries",
          header: "Open Queries",
          render: (value) => (
            <span className="text-amber-600 font-medium">
              {value as number}
            </span>
          ),
        },
        {
          key: "avgDaysOutstanding",
          header: "Avg Days Outstanding",
          render: (value) => (
            <span
              className={`font-medium ${
                (value as number) > 30
                  ? "text-red-600"
                  : (value as number) > 15
                    ? "text-amber-600"
                    : "text-gray-700"
              }`}
            >
              {value as number} days
            </span>
          ),
        },
        {
          key: "dataQualityScore",
          header: "Quality Score",
          render: (value) => (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (value as number) >= 90
                      ? "bg-emerald-500"
                      : (value as number) >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {value}%
              </span>
            </div>
          ),
        },
      ]}
    />
  );
}

// Specialized Subject Table
interface SubjectTableProps {
  data: SubjectMetric[];
  onSubjectClick?: (subjectId: string) => void;
}

export function SubjectTable({ data, onSubjectClick }: SubjectTableProps) {
  return (
    <DataTable
      title="Subjects Overview"
      data={data}
      onRowClick={(row) => onSubjectClick?.(row.subjectId)}
      columns={[
        {
          key: "subjectId",
          header: "Subject",
          render: (_, row) => (
            <div className="flex items-center gap-2">
              {row.isHighRisk && (
                <span
                  className="w-2 h-2 rounded-full bg-red-500"
                  title="High Risk"
                />
              )}
              <span className="font-medium text-gray-900">{row.subjectId}</span>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (value) => (
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                value === "On Trial"
                  ? "bg-emerald-100 text-emerald-700"
                  : value === "Discontinued"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {value as string}
            </span>
          ),
        },
        {
          key: "latestVisit",
          header: "Latest Visit",
          render: (value) => (
            <span className="text-gray-700">{value as string}</span>
          ),
        },
        {
          key: "missingVisits",
          header: "Missing",
          render: (value) => (
            <span
              className={`font-medium ${
                (value as number) > 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {value as number}
            </span>
          ),
        },
        {
          key: "totalQueries",
          header: "Queries",
          render: (value) => (
            <span
              className={`font-medium ${
                (value as number) > 20
                  ? "text-red-600"
                  : (value as number) > 0
                    ? "text-amber-600"
                    : "text-emerald-600"
              }`}
            >
              {value as number}
            </span>
          ),
        },
        {
          key: "dataQualityScore",
          header: "Quality",
          render: (value) => (
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    (value as number) >= 90
                      ? "bg-emerald-500"
                      : (value as number) >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{value}%</span>
            </div>
          ),
        },
      ]}
    />
  );
}
