"use client";

import React from "react";

interface QueryResponseTimeData {
    team: string;
    week1: number;
    week2: number;
    month1: number;
    over30: number;
    total: number;
}

interface QueryResponseTimeTableProps {
    data: QueryResponseTimeData[];
}

export default function QueryResponseTimeTable({
    data,
}: QueryResponseTimeTableProps) {
    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Query Age Distribution by Team
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Showing how long queries have been open for each team
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    &lt; 7 Days
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    7-14 Days
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    15-30 Days
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    &gt; 30 Days
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {row.team}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {row.week1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            {row.week2}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                            {row.month1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            {row.over30}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center bg-gray-50">
                                        <span className="font-bold text-gray-900">{row.total}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    TOTAL
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {data.reduce((sum, row) => sum + row.week1, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {data.reduce((sum, row) => sum + row.week2, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {data.reduce((sum, row) => sum + row.month1, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {data.reduce((sum, row) => sum + row.over30, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                                    {data.reduce((sum, row) => sum + row.total, 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100"></div>
                    <span className="text-gray-600">Recent (&lt;7 days)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-100"></div>
                    <span className="text-gray-600">Moderate (7-14 days)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                    <span className="text-gray-600">Aging (15-30 days)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-100"></div>
                    <span className="text-gray-600">Critical (&gt;30 days)</span>
                </div>
            </div>
        </div>
    );
}
