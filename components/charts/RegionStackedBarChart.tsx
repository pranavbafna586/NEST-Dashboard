"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RegionChartData } from "@/types";

interface RegionStackedBarChartProps {
  data: RegionChartData[];
  syncId?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => {
          // Multiply completedPages by 100 to show actual value
          const actualValue =
            entry.name === "Completed Pages" ? entry.value * 100 : entry.value;

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="text-gray-900 font-medium">
                {Math.round(actualValue).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function RegionStackedBarChart({
  data,
  syncId,
}: RegionStackedBarChartProps) {
  const [hiddenEntries, setHiddenEntries] = useState<Set<string>>(new Set());

  // Define bar configurations
  const barConfigs = [
    {
      dataKey: "completedPages",
      name: "Completed Pages",
      fill: "#8ED9E2",
    },
    {
      dataKey: "missingPages",
      name: "Missing Pages",
      fill: "#E57373",
    },
  ];

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
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-5">
        {barConfigs.map((bar, index) => {
          const isHidden = hiddenEntries.has(bar.name);
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggleEntry(bar.name)}
            >
              <div
                className="w-3 h-3 rounded-sm transition-opacity"
                style={{
                  backgroundColor: bar.fill,
                  opacity: isHidden ? 0.3 : 1,
                }}
              />
              <span
                className={`text-sm text-gray-700 transition-opacity ${isHidden ? "line-through opacity-50" : ""}`}
              >
                {bar.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Regional Data Entry Progress
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Missing vs Completed Pages by Region
        </p>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            syncId={syncId}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#F0F0F0" }}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#F0F0F0" }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {barConfigs.map((bar, index) => {
              const isHidden = hiddenEntries.has(bar.name);
              if (isHidden) return null;
              return (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  stackId="a"
                  fill={bar.fill}
                  radius={
                    index === barConfigs.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
