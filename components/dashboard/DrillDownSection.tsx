"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface DrillDownSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function DrillDownSection({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  headerAction,
}: DrillDownSectionProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Section Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}

// Stats Card Component for KPI details
interface StatsCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  color?: "blue" | "green" | "red" | "amber" | "purple" | "gray";
}

export function StatsCard({
  label,
  value,
  change,
  icon: Icon,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
      text: "text-green-600",
      border: "border-green-200",
    },
    red: {
      bg: "bg-red-50",
      icon: "bg-red-100 text-red-600",
      text: "text-red-600",
      border: "border-red-200",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-600",
      border: "border-amber-200",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "bg-gray-100 text-gray-600",
      text: "text-gray-600",
      border: "border-gray-200",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`${classes.bg} ${classes.border} border rounded-lg p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${classes.text}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                change.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{change.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(change.value)}%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${classes.icon} p-2.5 rounded-lg shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
