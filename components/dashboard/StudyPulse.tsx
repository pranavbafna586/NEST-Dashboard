"use client";

import React, { useState } from "react";
import { SubjectMetric } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StudyPulseProps {
  metrics: SubjectMetric[];
  studyId: string | "ALL";
}

export default function StudyPulse({ metrics, studyId }: StudyPulseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate total pages entered and total forms available
  const filteredMetrics =
    studyId === "ALL" ? metrics : metrics.filter((m) => m.studyId === studyId);

  const totalPagesEntered = filteredMetrics.reduce(
    (sum, m) => sum + m.pagesEntered,
    0,
  );
  const totalFormsAvailable = filteredMetrics.reduce(
    (sum, m) => sum + m.totalFormsAvailable,
    0,
  );

  // Calculate total queries raised (sum of 7 query types)
  const totalQueriesRaised = filteredMetrics.reduce(
    (sum, m) =>
      sum +
      m.queriesDM +
      m.queriesClinical +
      m.queriesMedical +
      m.queriesSite +
      m.queriesFieldMonitor +
      m.queriesCoding +
      m.queriesSafety,
    0,
  );

  // Calculate form completion percentage
  const completionPercentage =
    totalFormsAvailable > 0
      ? Math.round((totalPagesEntered / totalFormsAvailable) * 100)
      : 0;

  // Study name display
  const studyName =
    studyId === "ALL"
      ? "All Studies"
      : filteredMetrics[0]?.projectName || `Study ${studyId}`;

  // Prepare data for Recharts Pie Chart - Equal values for uniform circle
  const chartData = [
    {
      name: "Pages Entered",
      value: 20, // Equal value for uniform segments
      actualValue: totalPagesEntered,
      fill: "rgba(59, 130, 246, 0.85)", // blue
    },
    {
      name: "Total Queries",
      value: 20, // Equal value for uniform segments
      actualValue: totalQueriesRaised,
      fill: "rgba(251, 191, 36, 0.85)", // amber/yellow
    },
    {
      name: "Active Subjects",
      value: 20, // Equal value for uniform segments
      actualValue: filteredMetrics.length,
      fill: "rgba(107, 114, 128, 0.85)", // gray
    },
    {
      name: "Missing Pages",
      value: 20, // Equal value for uniform segments
      actualValue:
        totalFormsAvailable - totalPagesEntered > 0
          ? totalFormsAvailable - totalPagesEntered
          : 0,
      fill: "rgba(239, 68, 68, 0.85)", // red
    },
    {
      name: "Completion Rate",
      value: 20, // Equal value for uniform segments
      actualValue: completionPercentage,
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

  // Custom Legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Study Pulse</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          {studyName}
        </span>
      </div>

      {/* Polar Area Chart - Expanded */}
      <div className="flex-1 min-h-112.5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeShape={renderActiveShape}
              data={chartData}
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
              {chartData.map((entry, index) => (
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
          <span className="text-sm text-gray-600">Overall Status</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                completionPercentage >= 80
                  ? "bg-green-500"
                  : completionPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-700">
              {completionPercentage >= 80
                ? "On Track"
                : completionPercentage >= 50
                  ? "At Risk"
                  : "Critical"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
