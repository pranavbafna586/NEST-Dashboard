"use client";

import React from "react";
import { X } from "lucide-react";

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    loading?: boolean;
}

export default function DrillDownModal({
    isOpen,
    onClose,
    title,
    children,
    loading = false,
}: DrillDownModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
