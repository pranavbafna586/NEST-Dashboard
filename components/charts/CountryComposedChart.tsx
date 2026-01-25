"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CountryComposedChartProps {
  data: Array<{
    country: string;
    openQueries: number;
    avgDaysOutstanding: number;
  }>;
  syncId?: string;
  loading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="text-gray-900 font-medium">
              {entry.dataKey === "avgDaysOutstanding"
                ? `${entry.value} days`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CountryComposedChart({
  data,
  syncId,
}: CountryComposedChartProps) {
  const [hiddenEntries, setHiddenEntries] = useState<Set<string>>(new Set());

  // Define chart series
  const chartSeries = [
    { key: "openQueries", name: "Open Queries", color: "#7B74D1" },
    {
      key: "avgDaysOutstanding",
      name: "Avg Days Outstanding",
      color: "#8ED9E2",
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
        {chartSeries.map((series, index) => {
          const isHidden = hiddenEntries.has(series.name);
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggleEntry(series.name)}
            >
              <div
                className="w-3 h-3 rounded-sm transition-opacity"
                style={{
                  backgroundColor: series.color,
                  opacity: isHidden ? 0.3 : 1,
                }}
              />
              <span
                className={`text-sm text-gray-700 transition-opacity ${isHidden ? "line-through opacity-50" : ""}`}
              >
                {series.name}
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
          Country Performance
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Open Queries vs Average Resolution Time
        </p>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            syncId={syncId}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="country"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#F0F0F0" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#F0F0F0" }}
              label={{
                value: "Open Queries",
                angle: -90,
                position: "insideLeft",
                fill: "#6B7280",
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#F0F0F0" }}
              label={{
                value: "Avg Days",
                angle: 90,
                position: "insideRight",
                fill: "#6B7280",
                fontSize: 12,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {!hiddenEntries.has("Open Queries") && (
              <Bar
                yAxisId="left"
                dataKey="openQueries"
                name="Open Queries"
                fill="#7B74D1"
                radius={[4, 4, 0, 0]}
              />
            )}
            {!hiddenEntries.has("Avg Days Outstanding") && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgDaysOutstanding"
                name="Avg Days Outstanding"
                stroke="#8ED9E2"
                strokeWidth={3}
                dot={{ fill: "#8ED9E2", r: 5 }}
                activeDot={{ r: 7 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
