"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    // Magnetic button effect
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        };

        const handleMouseLeave = () => {
            button.style.transform = "translate(0, 0)";
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <motion.section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6"
            style={{ opacity, y }}
        >
            <div className="max-w-5xl mx-auto text-center z-10">
                {/* Version Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-pulse-glow"
                >
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-sm text-gray-600">
                        v2.0: AI-Powered Harmonization
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                >
                    <span className="gradient-text">Clinical Trial</span>
                    <br />
                    <span className="text-gray-900">Intelligence Engine</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Transform fragmented clinical data into actionable insights with our
                    AI-powered RAG engine. Real-time harmonization, predictive analytics,
                    and intelligent monitoring.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/dashboard"
                        ref={buttonRef}
                        className="magnetic-btn group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-blue-500/25"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Launch Dashboard
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </span>
                    </Link>

                    <button
                        onClick={() => {
                            document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-8 py-4 rounded-2xl text-gray-600 font-medium text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                        Explore Features
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16"
                >
                    {[
                        { value: "102+", label: "Subjects Tracked" },
                        { value: "574", label: "Queries Processed" },
                        { value: "7,351", label: "SDV Records" },
                        { value: "99.9%", label: "Data Accuracy" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold gradient-text">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
                >
                    <div className="w-1.5 h-3 rounded-full bg-gradient-to-b from-blue-600 to-cyan-600" />
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
