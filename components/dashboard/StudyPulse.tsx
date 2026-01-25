"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StudyPulseData {
  pagesEntered: number;
  totalQueries: number;
  activeSubjects: number;
  missingPages: number;
  cleanCRFPercentage: number;
}

interface StudyPulseProps {
  data: StudyPulseData;
  loading?: boolean;
}

export default function StudyPulse({ data, loading = false }: StudyPulseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hiddenEntries, setHiddenEntries] = useState<Set<string>>(new Set());

  // Prepare data for Recharts Pie Chart - Equal values for uniform circle
  const chartData = [
    {
      name: "Pages Entered",
      value: 20, // Equal value for uniform segments
      actualValue: data.pagesEntered,
      fill: "rgba(59, 130, 246, 0.85)", // blue
    },
    {
      name: "Total Queries",
      value: 20, // Equal value for uniform segments
      actualValue: data.totalQueries,
      fill: "rgba(251, 191, 36, 0.85)", // amber/yellow
    },
    {
      name: "Active Subjects",
      value: 20, // Equal value for uniform segments
      actualValue: data.activeSubjects,
      fill: "rgba(107, 114, 128, 0.85)", // gray
    },
    {
      name: "Missing Pages",
      value: 20, // Equal value for uniform segments
      actualValue: data.missingPages,
      fill: "rgba(239, 68, 68, 0.85)", // red
    },
    {
      name: "Clean CRF %",
      value: 20, // Equal value for uniform segments
      actualValue: data.cleanCRFPercentage,
      fill: "rgba(34, 197, 94, 0.85)", // green
      suffix: "%",
    },
  ];

  // Render active shape for pop-out effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 20} // Enlarge by 20px on hover
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
          style={{
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))",
          }}
        />
      </g>
    );
  };

  // Filter visible chart data
  const visibleChartData = chartData.filter(
    (item) => !hiddenEntries.has(item.name),
  );

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-700">
            {data.actualValue.toLocaleString()}
            {data.suffix || ""}
          </p>
        </div>
      );
    }
    return null;
  };

  // Toggle visibility of chart entries
  const toggleEntry = (entryName: string) => {
    setHiddenEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryName)) {
        newSet.delete(entryName);
      } else {
        newSet.add(entryName);
      }
      return newSet;
    });
  };

  // Custom Legend - Always shows all entries, regardless of visibility
  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {chartData.map((entry, index) => {
          const isHidden = hiddenEntries.has(entry.name);
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggleEntry(entry.name)}
            >
              <div
                className="w-3 h-3 rounded-sm transition-opacity"
                style={{
                  backgroundColor: entry.fill,
                  opacity: isHidden ? 0.3 : 1,
                }}
              />
              <span
                className={`text-xs text-gray-700 transition-opacity ${isHidden ? "line-through opacity-50" : ""}`}
              >
                {entry.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Study Pulse Dashboard
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Real-Time Key Performance Indicators
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading study pulse...</p>
        </div>
      ) : (
        <>
          {/* Polar Area Chart - Expanded */}
          <div className="flex-1 min-h-112.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeShape={renderActiveShape}
                  data={visibleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {visibleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Overall Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Quality Status</span>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.cleanCRFPercentage >= 80
                      ? "bg-green-500"
                      : data.cleanCRFPercentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {data.cleanCRFPercentage >= 80
                    ? "On Track"
                    : data.cleanCRFPercentage >= 50
                      ? "At Risk"
                      : "Critical"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
