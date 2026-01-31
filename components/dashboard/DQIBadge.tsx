/**
 * DQI Badge Component - Displays DQI score with color-coded badge
 * Can be used across the application for consistent DQI display
 */

import React from "react";
import { getDQIConfig, formatDQIScore } from "@/lib/dqi-utils";

interface DQIBadgeProps {
  score: number | null | undefined;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DQIBadge({
  score,
  showDescription = false,
  size = "md",
  className = "",
}: DQIBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className="text-xs text-gray-400">N/A</span>
    );
  }

  const config = getDQIConfig(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded-md font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
      >
        <span>{formatDQIScore(score)}</span>
        <span className="opacity-60">/100</span>
      </span>
      {showDescription && (
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${config.textColor}`}>
            {config.category}
          </span>
          <span className="text-xs text-gray-500">{config.description}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Clean Status Badge Component
 */
interface CleanStatusBadgeProps {
  isClean: boolean | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CleanStatusBadge({
  isClean,
  size = "md",
  className = "",
}: CleanStatusBadgeProps) {
  if (isClean === null || isClean === undefined) {
    return (
      <span className="text-xs text-gray-400">N/A</span>
    );
  }

  const config = isClean
    ? {
        label: "Clean",
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-800",
        borderColor: "border-emerald-300",
        icon: "✓",
      }
    : {
        label: "Unclean",
        bgColor: "bg-rose-100",
        textColor: "text-rose-800",
        borderColor: "border-rose-300",
        icon: "✗",
      };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]} ${className}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
