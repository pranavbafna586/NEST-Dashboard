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

interface ConformantPagesData {
    study: string;
    total_pages: number;
    conformant_pages: number;
    non_conformant_pages: number;
    avg_clean_percentage: number;
}

interface ConformantPagesChartProps {
    byStudy: ConformantPagesData[];
    overall: {
        total_pages: number;
        conformant_pages: number;
        non_conformant_pages: number;
        percentage: number;
    };
}

export default function ConformantPagesChart({
    byStudy,
    overall,
}: ConformantPagesChartProps) {
    return (
        <div className="space-y-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Pages</p>
                    <p className="text-3xl font-bold text-blue-700">
                        {overall.total_pages.toLocaleString()}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600 mb-1">
                        Conformant Pages
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                        {overall.conformant_pages.toLocaleString()}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-600 mb-1">
                        Non-Conformant
                    </p>
                    <p className="text-3xl font-bold text-red-700">
                        {overall.non_conformant_pages.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-emerald-600 mb-1">
                        Clean Rate
                    </p>
                    <p className="text-3xl font-bold text-emerald-700">
                        {overall.percentage}%
                    </p>
                </div>
            </div>

            {/* Study-wise Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Clean CRF Percentage by Study
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={byStudy}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="study" />
                        <YAxis
                            label={{
                                value: "Percentage (%)",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                            formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                        />
                        <Legend />
                        <Bar
                            dataKey="avg_clean_percentage"
                            fill="#10b981"
                            name="Clean Percentage"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Study Details Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Study
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Pages
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Conformant
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Non-Conformant
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Clean %
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {byStudy
                            .sort((a, b) => b.avg_clean_percentage - a.avg_clean_percentage)
                            .map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {row.study}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                                        {row.total_pages.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {row.conformant_pages.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            {row.non_conformant_pages.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(100, row.avg_clean_percentage)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {row.avg_clean_percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
