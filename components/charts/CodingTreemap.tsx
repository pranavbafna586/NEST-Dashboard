"use client";

import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { CodingCategoryData } from "@/types";

interface CodingTreemapProps {
  data: CodingCategoryData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CodingCategoryData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 mb-2">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="text-gray-600">
            Total Terms:{" "}
            <span className="text-gray-900 font-medium">{data.size}</span>
          </p>
          <p className="text-emerald-600">
            Coded: <span className="font-medium">{data.coded}</span>
          </p>
          <p className="text-red-600">
            Uncoded: <span className="font-medium">{data.uncoded}</span>
          </p>
          <p className="text-gray-600">
            Progress:{" "}
            <span className="text-gray-900 font-medium">
              {data.size > 0 ? Math.round((data.coded / data.size) * 100) : 0}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  coded?: number;
  uncoded?: number;
  color?: string;
}

const CustomContent = (props: CustomContentProps) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name,
    coded = 0,
    uncoded = 0,
    color,
  } = props;

  if (width < 50 || height < 50) return null;

  const total = coded + uncoded;
  const percentage = total > 0 ? Math.round((coded / total) * 100) : 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: "#ffffff",
          strokeWidth: 3,
          strokeOpacity: 1,
        }}
      />
      {width > 80 && height > 60 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 15}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={14}
            fontWeight="700"
            stroke="#000000"
            strokeWidth="0.5"
            paintOrder="stroke fill"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={13}
            fontWeight="600"
            stroke="#000000"
            strokeWidth="0.5"
            paintOrder="stroke fill"
          >
            {total} terms
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 25}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={12}
            fontWeight="600"
            stroke="#000000"
            strokeWidth="0.5"
            paintOrder="stroke fill"
          >
            {percentage}% coded
          </text>
        </>
      )}
      {width > 50 && height > 40 && width <= 80 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={12}
            fontWeight="700"
            stroke="#000000"
            strokeWidth="0.5"
            paintOrder="stroke fill"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={11}
            fontWeight="600"
            stroke="#000000"
            strokeWidth="0.5"
            paintOrder="stroke fill"
          >
            {total}
          </text>
        </>
      )}
    </g>
  );
};

export default function CodingTreemap({ data }: CodingTreemapProps) {
  const [hiddenEntries, setHiddenEntries] = useState<Set<string>>(new Set());

  // Filter visible data
  const visibleData = data.filter((item) => !hiddenEntries.has(item.name));
  const totalTerms = visibleData.reduce((sum, item) => sum + item.size, 0);
  const totalCoded = visibleData.reduce((sum, item) => sum + item.coded, 0);
  const overallProgress =
    totalTerms > 0 ? Math.round((totalCoded / totalTerms) * 100) : 0;

  // Toggle visibility of chart entries
  const toggleEntry = (entryName: string) => {
    setHiddenEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryName)) {
        newSet.delete(entryName);
      } else {
        newSet.add(entryName);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Medical Coding Distribution
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              MedDRA & WHODrug Coding Categories
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {overallProgress}%
            </p>
            <p className="text-xs text-gray-600">Overall Progress</p>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <Treemap
          data={visibleData as any}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#1e293b"
          fill="#8884d8"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((category, index) => {
          const isHidden = hiddenEntries.has(category.name);
          return (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer select-none transition-opacity"
              onClick={() => toggleEntry(category.name)}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 transition-opacity"
                style={{
                  backgroundColor: category.color,
                  opacity: isHidden ? 0.3 : 1,
                }}
              />
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium text-gray-900 truncate transition-opacity ${isHidden ? "line-through opacity-50" : ""}`}
                >
                  {category.name}
                </p>
                <p
                  className={`text-xs text-gray-600 ${isHidden ? "line-through opacity-50" : ""}`}
                >
                  {category.coded}/{category.size}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
