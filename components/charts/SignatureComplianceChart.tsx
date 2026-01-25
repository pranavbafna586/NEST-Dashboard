"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

export interface SignatureComplianceData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface SignatureComplianceChartProps {
  data: SignatureComplianceData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SignatureComplianceData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {data.category}
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-gray-600">
            Count:{" "}
            <span className="text-gray-900 font-medium">
              {data.count.toLocaleString()}
            </span>
          </p>
          <p className="text-gray-600">
            Percentage:{" "}
            <span className="text-gray-900 font-medium">
              {data.percentage.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data }: { data: SignatureComplianceData[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-700">
            {entry.category} ({entry.count.toLocaleString()})
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SignatureComplianceChart({
  data,
}: SignatureComplianceChartProps) {
  // Calculate total and compliance rate
  const totalForms = data.reduce((sum, item) => sum + item.count, 0);
  const compliantForms =
    data.find((item) => item.category === "Compliant (<45 Days)")?.count || 0;
  const complianceRate =
    totalForms > 0 ? ((compliantForms / totalForms) * 100).toFixed(1) : "0.0";

  // Determine compliance level color
  const complianceRateNum = parseFloat(complianceRate);
  const rateColor =
    complianceRateNum >= 80
      ? "text-green-600"
      : complianceRateNum >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Signature Compliance Status
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Regulatory Document Signing Progress
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-600">Total Forms: </span>
            <span className="font-semibold text-gray-900">
              {totalForms.toLocaleString()}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Compliance Rate: </span>
            <span className={`font-semibold ${rateColor}`}>
              {complianceRate}%
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            dataKey="category"
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <CustomLegend data={data} />

      {/* Risk indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#E57373" }}
            ></div>
            <span className="text-gray-600">Critical Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#FFD54F" }}
            ></div>
            <span className="text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
