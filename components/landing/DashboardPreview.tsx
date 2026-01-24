"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function DashboardPreview() {
    const sectionRef = useRef<HTMLElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
        previewRef.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg)`;
    };

    const handleMouseLeave = () => {
        if (!previewRef.current) return;
        previewRef.current.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };

    return (
        <section
            id="preview"
            ref={sectionRef}
            className="relative py-24 px-6 overflow-hidden"
        >
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-sm text-cyan-600 mb-4">
                        Interactive Preview
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        See your data
                        <br />
                        <span className="gradient-text">come alive</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Explore our intelligent dashboard that transforms complex clinical
                        data into actionable insights.
                    </p>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl -z-10" />

                    <div
                        ref={previewRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="relative bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 transition-transform duration-200 ease-out shadow-xl"
                    >
                        {/* Mock Dashboard Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="text-sm text-gray-500">
                                Clinical Trial Intelligence Engine
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-gray-500">Live</span>
                            </div>
                        </div>

                        {/* Mock Dashboard Content */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* KPI Cards */}
                            {[
                                { label: "Active Subjects", value: "102", color: "blue" },
                                { label: "Open Queries", value: "47", color: "amber" },
                                { label: "SDV Complete", value: "89%", color: "emerald" },
                                { label: "Risk Score", value: "Low", color: "cyan" },
                            ].map((kpi, i) => (
                                <motion.div
                                    key={kpi.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                                >
                                    <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
                                    <div
                                        className={`text-2xl font-bold ${kpi.color === "blue"
                                                ? "text-blue-600"
                                                : kpi.color === "amber"
                                                    ? "text-amber-600"
                                                    : kpi.color === "emerald"
                                                        ? "text-emerald-600"
                                                        : "text-cyan-600"
                                            } group-hover:scale-105 transition-transform`}
                                    >
                                        {kpi.value}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {/* Main Chart */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4 h-48"
                            >
                                <div className="text-sm text-gray-600 mb-3">Regional Progress</div>
                                <div className="flex items-end h-32 gap-3">
                                    {[65, 45, 80, 55, 70, 85, 60, 75].map((height, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={isInView ? { height: `${height}%` } : {}}
                                            transition={{ duration: 0.5, delay: 0.9 + i * 0.05 }}
                                            className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-500"
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Side Panel */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.5, delay: 1 }}
                                className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                            >
                                <div className="text-sm text-gray-600 mb-3">Recent Activity</div>
                                <div className="space-y-3">
                                    {[
                                        { text: "Query resolved", time: "2m ago", dot: "green" },
                                        { text: "New SAE reported", time: "15m ago", dot: "red" },
                                        { text: "Data sync complete", time: "1h ago", dot: "blue" },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full ${item.dot === "green"
                                                        ? "bg-emerald-500"
                                                        : item.dot === "red"
                                                            ? "bg-red-500"
                                                            : "bg-blue-500"
                                                    }`}
                                            />
                                            <span className="text-gray-600">{item.text}</span>
                                            <span className="ml-auto text-gray-400">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
