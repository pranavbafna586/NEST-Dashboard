"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About", href: "#about" },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollYProgress } = useScroll();

    // Header shrinks on scroll
    const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
    const headerPadding = useTransform(scrollYProgress, [0, 0.1], [16, 12]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 z-[60] scroll-progress"
                style={{ scaleX: scrollYProgress }}
            />

            {/* Floating Header */}
            <motion.header
                className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300`}
                style={{ scale: headerScale }}
            >
                <motion.nav
                    className={`glass rounded-full px-6 transition-all duration-300 flex items-center justify-between ${isScrolled ? "shadow-lg" : "shadow-md"
                        }`}
                    style={{ paddingTop: headerPadding, paddingBottom: headerPadding }}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">CT</span>
                        </div>
                        <span className="font-semibold text-gray-900 tracking-tight hidden sm:block">
                            CTIE
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {navLinks.map((link) =>
                            link.href.startsWith("/") ? (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                                >
                                    {link.name}
                                </Link>
                            ) : (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.href)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                                >
                                    {link.name}
                                </button>
                            )
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link
                        href="/dashboard"
                        className="magnetic-btn px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-white text-sm font-medium hover:scale-105 transition-transform shadow-md"
                    >
                        Launch App
                    </Link>
                </motion.nav>
            </motion.header>
        </>
    );
}
