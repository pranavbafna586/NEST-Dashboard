"use client";

import React from "react";
import { KPISummary, ResponsibleFunction, ROLE_KPI_MAPPING } from "@/types";

interface KPICardsProps {
  summary: KPISummary;
  role?: ResponsibleFunction;
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "red" | "amber" | "blue" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function KPICard({ title, value, icon, color, trend }: KPICardProps) {
  const colorClasses = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      valueText: "text-red-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      valueText: "text-amber-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      valueText: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
      valueText: "text-purple-600",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`bg-white ${classes.border} border rounded-xl p-5 transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${classes.valueText}`}>
              {value.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={`${classes.iconBg} ${classes.iconText} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ summary, role }: KPICardsProps) {
  // If role is specified, filter KPIs based on ROLE_KPI_MAPPING
  const roleConfig = role
    ? ROLE_KPI_MAPPING.find((config) => config.role === role)
    : null;

  // KPI configuration mapping
  const allKPIs = {
    totalMissingVisits: {
      key: "missingVisits",
      title: "Total Missing Visits",
      value: summary.totalMissingVisits,
      color: "red" as const,
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    openQueries: {
      key: "openQueries",
      title: "Open Queries",
      value: summary.openQueries,
      color: "amber" as const,
      icon: (
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
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    seriousAdverseEvents: {
      key: "activeSAEs",
      title: "Active SAEs",
      value: summary.seriousAdverseEvents,
      color: "blue" as const,
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    uncodedTerms: {
      key: "uncodedTerms",
      title: "Uncoded Terms",
      value: summary.uncodedTerms,
      color: "purple" as const,
      icon: (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
  };

  // Filter KPIs based on role configuration
  let displayKPIs = Object.values(allKPIs);
  if (roleConfig) {
    displayKPIs = Object.values(allKPIs).filter((kpi) =>
      roleConfig.criticalKPIs.includes(kpi.key),
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayKPIs.map((kpi) => (
        <KPICard
          key={kpi.key}
          title={kpi.title}
          value={kpi.value}
          color={kpi.color}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
}
