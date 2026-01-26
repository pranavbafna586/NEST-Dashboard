"use client";

import React from "react";
import { KPISummary, ResponsibleFunction, ROLE_KPI_MAPPING } from "@/types";

interface KPICardsProps {
  summary: KPISummary;
  role?: ResponsibleFunction;
  onKPIClick?: (kpiType: string) => void;
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "red" | "amber" | "blue" | "purple" | "green" | "indigo";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

function KPICard({ title, value, icon, color, trend, onClick }: KPICardProps) {
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
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      valueText: "text-green-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      valueText: "text-indigo-600",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`bg-white ${classes.border} border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      }`}
      onClick={onClick}
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

export default function KPICards({ summary, role, onKPIClick }: KPICardsProps) {
  // If role is specified, filter KPIs based on ROLE_KPI_MAPPING
  const roleConfig = role
    ? ROLE_KPI_MAPPING.find((config) => config.role === role)
    : null;

  // KPI configuration mapping
  const allKPIs = {
    totalSubjects: {
      key: "totalSubjects",
      title: "Total Subjects Enrolled",
      value: summary.totalSubjects || 0,
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
    conformantPages: {
      key: "conformantPages",
      title: "Clean CRF Percentage",
      value: summary.conformantPagesPercentage || 0,
      color: "green" as const,
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  // Filter KPIs based on role configuration (if role is provided)
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
          onClick={() => onKPIClick?.(kpi.key)}
        />
      ))}
    </div>
  );
}
