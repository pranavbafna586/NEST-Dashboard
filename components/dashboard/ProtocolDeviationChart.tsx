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

interface ProtocolDeviationData {
    study: string;
    confirmed: number;
    proposed: number;
    total: number;
}

interface ProtocolDeviationChartProps {
    byStudy: ProtocolDeviationData[];
    overall: {
        confirmed: number;
        proposed: number;
        total: number;
    };
}

export default function ProtocolDeviationChart({
    byStudy,
    overall,
}: ProtocolDeviationChartProps) {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600 mb-1">
                        Total Deviations
                    </p>
                    <p className="text-3xl font-bold text-blue-700">{overall.total}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600 mb-1">
                        Confirmed PDs
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                        {overall.confirmed}
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-600 mb-1">
                        Proposed PDs
                    </p>
                    <p className="text-3xl font-bold text-amber-700">{overall.proposed}</p>
                </div>
            </div>

            {/* Grouped Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Protocol Deviations by Study
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
                        <Legend />
                        <Bar
                            dataKey="confirmed"
                            fill="#10b981"
                            name="Confirmed"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="proposed"
                            fill="#f59e0b"
                            name="Proposed"
                            radius={[8, 8, 0, 0]}
                        />
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
                                Confirmed
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Proposed
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Confirmation Rate
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {byStudy
                            .sort((a, b) => b.total - a.total)
                            .map((row, index) => {
                                const confirmationRate =
                                    row.total > 0
                                        ? Math.round((row.confirmed / row.total) * 100)
                                        : 0;
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.study}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                {row.confirmed}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                {row.proposed}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                                            {row.total}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${confirmationRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-600">
                                                    {confirmationRate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
