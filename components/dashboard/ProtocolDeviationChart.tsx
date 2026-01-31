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

interface ProtocolDeviationByStudy {
    studyName: string;
    confirmedCount: number;
    proposedCount: number;
    totalCount: number;
}

interface ProtocolDeviationBySite {
    studyName: string;
    siteId: string;
    confirmedCount: number;
    proposedCount: number;
    totalCount: number;
}

interface ProtocolDeviationChartProps {
    byStudy: ProtocolDeviationByStudy[];
    bySite?: ProtocolDeviationBySite[];
    overall?: {
        confirmed: number;
        proposed: number;
        total: number;
    };
    summary?: {
        totalProtocolDeviations: number;
        confirmedCount: number;
        proposedCount: number;
    };
}

export default function ProtocolDeviationChart({
    byStudy,
    bySite = [],
    overall,
    summary,
}: ProtocolDeviationChartProps) {
    const actualSummary = summary || overall;
    
    return (
        <div className="space-y-6">
            {/* Summary Pills */}
            <div className="flex gap-4 justify-center">
                <div className="inline-flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-full px-6 py-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase">Confirmed PDs</p>
                        <p className="text-2xl font-bold text-emerald-700">
                            {actualSummary?.confirmedCount || actualSummary?.confirmed || 0}
                        </p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-full px-6 py-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-amber-600 uppercase">Proposed PDs</p>
                        <p className="text-2xl font-bold text-amber-700">
                            {actualSummary?.proposedCount || actualSummary?.proposed || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grouped Bar Chart by Study */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Protocol Deviations by Study
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={byStudy.map(item => ({
                        study: item.studyName,
                        confirmed: item.confirmedCount,
                        proposed: item.proposedCount,
                        total: item.totalCount,
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="study" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="confirmed"
                            fill="#10b981"
                            name="Confirmed PDs"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="proposed"
                            fill="#f59e0b"
                            name="Proposed PDs"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Site-Level Details Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Protocol Deviations by Study and Site
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Study
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Site
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    PD Confirmed
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    PD Proposed
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total PDs
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bySite.length > 0 ? (
                                bySite.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.studyName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {item.siteId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                {item.confirmedCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                {item.proposedCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                {item.totalCount}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No protocol deviation data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
