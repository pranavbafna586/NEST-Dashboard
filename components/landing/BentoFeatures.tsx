"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    Database,
    Zap,
    Shield,
    Brain,
    LineChart,
    Users,
} from "lucide-react";

const features = [
    {
        icon: Brain,
        title: "AI-Powered RAG Engine",
        description:
            "Advanced retrieval-augmented generation for intelligent data harmonization and query resolution.",
        gradient: "from-blue-500 to-indigo-500",
        span: "col-span-2",
    },
    {
        icon: Database,
        title: "Data Harmonization",
        description:
            "Automatically standardize and unify clinical data from multiple sources.",
        gradient: "from-cyan-500 to-blue-500",
        span: "col-span-1",
    },
    {
        icon: LineChart,
        title: "Real-time Analytics",
        description:
            "Live dashboards with predictive insights and anomaly detection.",
        gradient: "from-teal-500 to-cyan-500",
        span: "col-span-1",
    },
    {
        icon: Shield,
        title: "Compliance Ready",
        description:
            "Built-in CDISC, SDTM, and ADaM compliance with automated validation.",
        gradient: "from-green-500 to-emerald-500",
        span: "col-span-1",
    },
    {
        icon: Zap,
        title: "Accelerated Execution",
        description:
            "Reduce study timelines by 40% with automated data flows and intelligent alerts.",
        gradient: "from-amber-500 to-orange-500",
        span: "col-span-1",
    },
    {
        icon: Users,
        title: "Collaborative Workspace",
        description:
            "Role-based dashboards for monitors, data managers, and medical reviewers.",
        gradient: "from-pink-500 to-rose-500",
        span: "col-span-2",
    },
];

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
            onMouseMove={handleMouseMove}
            className={`${feature.span} spotlight-card bg-white border border-gray-200 rounded-3xl p-8 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg`}
        >
            {/* Icon */}
            <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
            >
                <feature.icon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
        </motion.div>
    );
}

export default function BentoFeatures() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section
            id="features"
            ref={sectionRef}
            className="relative py-24 px-6"
        >
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm text-blue-600 mb-4">
                        Powerful Features
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Everything you need for
                        <br />
                        <span className="gradient-text">clinical excellence</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        A complete suite of tools designed to accelerate your clinical
                        trials with AI-powered intelligence.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="bento-grid">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
