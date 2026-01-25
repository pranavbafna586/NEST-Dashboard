"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { SAEChartData } from "@/types";

interface SAEDonutChartProps {
  data: SAEChartData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: SAEChartData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="text-gray-900 font-medium">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Removed percentage labels for cleaner appearance
const renderCustomLabel = () => null;

export default function SAEDonutChart({ data }: SAEDonutChartProps) {
  const [hiddenEntries, setHiddenEntries] = useState<Set<string>>(new Set());

  // Filter visible data
  const visibleData = data.filter((item) => !hiddenEntries.has(item.name));
  const totalSAEs = visibleData.reduce((sum, item) => sum + item.value, 0);

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

  // Custom Legend - Always shows all entries
  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((entry, index) => {
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
                  backgroundColor: entry.color,
                  opacity: isHidden ? 0.3 : 1,
                }}
              />
              <span
                className={`text-sm text-gray-700 transition-opacity ${isHidden ? "line-through opacity-50" : ""}`}
              >
                {entry.name} ({entry.value})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Serious Adverse Events
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Safety Review Status Distribution
        </p>
      </div>
      <ResponsiveContainer width="100%" height={450}>
        <PieChart>
          <Pie
            data={visibleData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={70}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {visibleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {/* Center Label */}
          <text
            x="50%"
            y="41%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-600 text-sm font-medium"
          >
            Total SAEs
          </text>
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-900 text-2xl font-bold"
          >
            {totalSAEs}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
