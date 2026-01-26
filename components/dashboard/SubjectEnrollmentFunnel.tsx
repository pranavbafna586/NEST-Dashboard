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
  Cell,
} from "recharts";
import DrillDownSection, { StatsCard } from "./DrillDownSection";
import { Users, UserCheck, TrendingUp, UserX, XCircle } from "lucide-react";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface SubjectEnrollmentFunnelProps {
  funnelData: FunnelStage[];
  excluded: {
    screenFailure: number;
    discontinued: number;
  };
  totals: {
    totalSubjects: number;
    activeSubjects: number;
  };
}

export default function SubjectEnrollmentFunnel({
  funnelData,
  excluded,
  totals,
}: SubjectEnrollmentFunnelProps) {
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const completionRate =
    funnelData.length > 0 && funnelData[0].count > 0
      ? Math.round(
          (funnelData[funnelData.length - 1].count / funnelData[0].count) * 100,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <DrillDownSection
        title="Key Enrollment Metrics"
        subtitle="Overview of subject enrollment and completion statistics"
        icon={Users}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Total Subjects"
            value={totals.totalSubjects}
            icon={Users}
            color="blue"
          />
          <StatsCard
            label="Active Subjects"
            value={totals.activeSubjects}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            label="Completion Rate"
            value={`${completionRate}%`}
            icon={TrendingUp}
            color="amber"
          />
        </div>
      </DrillDownSection>

      {/* Funnel Visualization */}
      <DrillDownSection
        title="Enrollment Funnel"
        subtitle="Subject progression through enrollment stages"
        icon={TrendingUp}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-gray-800">
                        {data.stage}
                      </p>
                      <p className="text-sm text-gray-600">
                        Count: <span className="font-bold">{data.count}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Conversion:{" "}
                        <span className="font-bold">{data.percentage}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Subject Count" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </DrillDownSection>

      {/* Exclusions and Discontinuations */}
      <DrillDownSection
        title="Exclusions & Discontinuations"
        subtitle="Subjects excluded or discontinued from the study"
        icon={UserX}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            label="Screen Failures"
            value={excluded.screenFailure}
            icon={XCircle}
            color="red"
          />
          <StatsCard
            label="Discontinued"
            value={excluded.discontinued}
            icon={UserX}
            color="amber"
          />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Screen Failures:</span> Subjects who
            did not meet eligibility criteria during screening
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Discontinued:</span> Subjects who
            withdrew consent or stopped participation early
          </p>
        </div>
      </DrillDownSection>
    </div>
  );
}
