"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
    return (
        <footer id="about" className="relative py-16 px-6 border-t border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                <span className="text-white font-bold">CT</span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">CTIE</div>
                                <div className="text-xs text-gray-500">
                                    Clinical Trial Intelligence Engine
                                </div>
                            </div>
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                            Transforming clinical trial data management with AI-powered
                            harmonization, real-time analytics, and intelligent insights.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gray-900 font-medium mb-4">Product</h4>
                        <ul className="space-y-2">
                            {["Dashboard", "Features", "Analytics", "Documentation"].map(
                                (link) => (
                                    <li key={link}>
                                        <Link
                                            href={link === "Dashboard" ? "/dashboard" : "#"}
                                            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-gray-900 font-medium mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {["API Reference", "Support", "Privacy Policy", "Terms"].map(
                                (link) => (
                                    <li key={link}>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                        © 2026 NEST Hackathon. All rights reserved.
                    </div>

                    {/* System Status */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200"
                    >
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="text-xs text-emerald-600 font-medium">
                            Status: System Online
                        </span>
                    </motion.div>
                </div>
            </div>
        </footer>
    );
}
