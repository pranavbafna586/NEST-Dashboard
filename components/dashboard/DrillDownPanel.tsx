"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  kpiType?: string;
}

export default function DrillDownPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  loading = false,
  breadcrumbs,
  kpiType,
}: DrillDownPanelProps) {
  // Add custom scrollbar styles when panel is open
  useEffect(() => {
    if (isOpen) {
      // Add custom scrollbar styles for webkit browsers
      const style = document.createElement("style");
      style.id = "drill-down-scrollbar-styles";
      style.textContent = `
        .drill-down-content::-webkit-scrollbar {
          width: 8px;
        }
        .drill-down-content::-webkit-scrollbar-track {
          background: #e5e7eb;
        }
        .drill-down-content::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .drill-down-content::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Remove custom scrollbar styles
      const style = document.getElementById("drill-down-scrollbar-styles");
      if (style) {
        style.remove();
      }
    }
    return () => {
      const style = document.getElementById("drill-down-scrollbar-styles");
      if (style) {
        style.remove();
      }
    };
  }, [isOpen]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Color scheme based on KPI type
  const getColorScheme = (type?: string) => {
    switch (type) {
      case "totalSubjects":
        return {
          gradient: "from-blue-500 to-blue-600",
          icon: "bg-blue-100 text-blue-600",
          border: "border-blue-200",
        };
      case "openQueries":
        return {
          gradient: "from-amber-500 to-amber-600",
          icon: "bg-amber-100 text-amber-600",
          border: "border-amber-200",
        };
      case "activeSAEs":
        return {
          gradient: "from-blue-500 to-blue-600",
          icon: "bg-blue-100 text-blue-600",
          border: "border-blue-200",
        };
      case "missingVisits":
        return {
          gradient: "from-red-500 to-red-600",
          icon: "bg-red-100 text-red-600",
          border: "border-red-200",
        };
      case "uncodedTerms":
        return {
          gradient: "from-purple-500 to-purple-600",
          icon: "bg-purple-100 text-purple-600",
          border: "border-purple-200",
        };
      case "conformantPages":
        return {
          gradient: "from-green-500 to-green-600",
          icon: "bg-green-100 text-green-600",
          border: "border-green-200",
        };
      case "protocolDeviations":
        return {
          gradient: "from-red-500 to-red-600",
          icon: "bg-red-100 text-red-600",
          border: "border-red-200",
        };
      default:
        return {
          gradient: "from-indigo-500 to-indigo-600",
          icon: "bg-indigo-100 text-indigo-600",
          border: "border-indigo-200",
        };
    }
  };

  const colorScheme = getColorScheme(kpiType);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-2/5 z-[60] bg-white shadow-2xl flex flex-col transition-all duration-300"
            style={{
              maxHeight: "100vh",
            }}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r ${colorScheme.gradient} text-white shrink-0`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="min-w-0 flex-1">
                  {/* Breadcrumbs */}
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 mb-1 text-sm text-white/80 overflow-x-auto">
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <span>/</span>}
                          {crumb.onClick ? (
                            <button
                              onClick={crumb.onClick}
                              className="hover:text-white hover:underline whitespace-nowrap"
                            >
                              {crumb.label}
                            </button>
                          ) : (
                            <span className="whitespace-nowrap">
                              {crumb.label}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  <h2 className="text-xl md:text-2xl font-bold truncate">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-white/90 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div
              className="drill-down-content flex-1 overflow-y-auto bg-gray-50"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#9ca3af #e5e7eb",
                minHeight: 0,
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600" />
                  <p className="text-gray-600 font-medium">
                    Loading details...
                  </p>
                </div>
              ) : (
                <div className="p-6">{children}</div>
              )}
            </div>

            {/* Optional Footer for actions */}
            {!loading && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Press{" "}
                    <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> to
                    close
                  </span>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
