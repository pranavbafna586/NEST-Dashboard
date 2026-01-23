"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PatientVisitData } from "@/types";

interface PatientVisitTimelineProps {
  data: PatientVisitData[];
  subjectId: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PatientVisitData }>;
}) => {
  if (active && payload && payload.length) {
    const visit = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {visit.visitName}
        </p>
        <p className="text-xs text-gray-600 mb-1">
          Date: <span className="text-gray-900">{visit.projectedDate}</span>
        </p>
        <p className="text-xs text-gray-600 mb-1">
          Status:{" "}
          <span
            className={`font-medium ${
              visit.status === "Completed"
                ? "text-emerald-600"
                : visit.status === "Missing"
                  ? "text-red-600"
                  : visit.status === "Overdue"
                    ? "text-amber-600"
                    : "text-blue-600"
            }`}
          >
            {visit.status}
          </span>
        </p>
        {visit.daysOutstanding && (
          <p className="text-xs text-gray-600">
            Outstanding:{" "}
            <span className="text-red-600 font-medium">
              {visit.daysOutstanding} days
            </span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: PatientVisitData;
}) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  let fill = "#22c55e"; // green for completed
  if (payload.status === "Missing")
    fill = "#ef4444"; // red for missing
  else if (payload.status === "Overdue")
    fill = "#f59e0b"; // amber for overdue
  else if (payload.status === "Upcoming") fill = "#3b82f6"; // blue for upcoming

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={2}
      />
      {payload.status === "Missing" && (
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="none"
          stroke={fill}
          strokeWidth={2}
          opacity={0.3}
        />
      )}
    </g>
  );
};

export default function PatientVisitTimeline({
  data,
  subjectId,
}: PatientVisitTimelineProps) {
  const chartData = data.map((visit, index) => ({
    ...visit,
    index,
    value:
      visit.status === "Completed" ? 1 : visit.status === "Missing" ? 0.3 : 0.7,
  }));

  const completedCount = data.filter((v) => v.status === "Completed").length;
  const missingCount = data.filter((v) => v.status === "Missing").length;
  const upcomingCount = data.filter((v) => v.status === "Upcoming").length;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Patient Visit Timeline
            </h3>
            <p className="text-sm text-gray-600 mt-1">Subject: {subjectId}</p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">Completed: {completedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Missing: {missingCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Upcoming: {upcomingCount}</span>
            </div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="visitName"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={{ stroke: "#d1d5db" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis hide domain={[0, 1]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
