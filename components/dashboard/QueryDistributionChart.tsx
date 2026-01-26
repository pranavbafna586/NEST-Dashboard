"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import DrillDownSection, { StatsCard } from "./DrillDownSection";
import { MessageSquare, Users, AlertCircle } from "lucide-react";

interface QueryDistribution {
  team: string;
  count: number;
  color: string;
}

interface QueryDistributionChartProps {
  distribution: QueryDistribution[];
  total: number;
}

export default function QueryDistributionChart({
  distribution,
  total,
}: QueryDistributionChartProps) {
  const topTeam =
    distribution.length > 0
      ? distribution.reduce((prev, current) =>
          prev.count > current.count ? prev : current,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <DrillDownSection
        title="Query Overview"
        subtitle="Total open queries and top team allocation"
        icon={MessageSquare}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            label="Total Open Queries"
            value={total}
            icon={MessageSquare}
            color="amber"
          />
          {topTeam && (
            <StatsCard
              label={`${topTeam.team} (Highest)`}
              value={topTeam.count}
              icon={AlertCircle}
              color="red"
            />
          )}
        </div>
      </DrillDownSection>

      {/* Distribution Visualization */}
      <DrillDownSection
        title="Query Distribution by Team"
        subtitle="Visual breakdown of query allocation across teams"
        icon={Users}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="team"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Team Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Team Breakdown
            </h4>
            <div className="space-y-3">
              {distribution
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-700">
                        {item.team}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        {item.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((item.count / total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DrillDownSection>
    </div>
  );
}
