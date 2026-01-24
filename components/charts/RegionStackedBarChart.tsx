"use client";

import React from "react";
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
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="text-gray-900 font-medium">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RegionStackedBarChart({
  data,
  syncId,
}: RegionStackedBarChartProps) {
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
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span className="text-gray-700 text-sm">{value}</span>
              )}
            />
            <Bar
              dataKey="completedPages"
              name="Completed Pages"
              stackId="a"
              fill="#8ED9E2"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="missingPages"
              name="Missing Pages"
              stackId="a"
              fill="#E57373"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
