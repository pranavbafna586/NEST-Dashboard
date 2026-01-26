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
} from "recharts";

interface EDRRIssuesData {
    study: string;
    total_issues: number;
    subjects_affected: number;
}

interface EDRRIssuesChartProps {
    byStudy: EDRRIssuesData[];
    overall: {
        total_issues: number;
        subjects_affected: number;
    };
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function EDRRIssuesChart({
    byStudy,
    overall,
}: EDRRIssuesChartProps) {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-600 mb-1">
                        Total Open EDRR Issues
                    </p>
                    <p className="text-3xl font-bold text-red-700">
                        {overall.total_issues}
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-600 mb-1">
                        Subjects Affected
                    </p>
                    <p className="text-3xl font-bold text-amber-700">
                        {overall.subjects_affected}
                    </p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    EDRR Issues by Study
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={byStudy}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="study" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Bar dataKey="total_issues" name="Open Issues" radius={[8, 8, 0, 0]}>
                            {byStudy.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Details Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Study
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Open Issues
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subjects Affected
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Avg Issues per Subject
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {byStudy
                            .sort((a, b) => b.total_issues - a.total_issues)
                            .map((row, index) => {
                                const avgPerSubject =
                                    row.subjects_affected > 0
                                        ? (row.total_issues / row.subjects_affected).toFixed(1)
                                        : "0.0";
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.study}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                {row.total_issues}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                {row.subjects_affected}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                                            {avgPerSubject}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> EDRR issues represent discrepancies between
                    hospital records and external lab/pharmacy data that require
                    reconciliation.
                </p>
            </div>
        </div>
    );
}
