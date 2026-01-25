"use client";

import React, { useState, useRef, useEffect } from "react";

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  icon?: React.ReactNode;
  showCount?: boolean;
}

export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  loading = false,
  label,
  icon,
  showCount = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get display value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          {label}
        </label>
      )}

      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between ${
            disabled || loading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-blue-400"
          }`}
        >
          <span className={value === "ALL" ? "text-gray-600" : "text-gray-900"}>
            {loading
              ? `Loading ${label?.toLowerCase() || "data"}...`
              : displayValue}
            {showCount && !loading && value === "ALL" && options.length > 0
              ? ` (${options.length})`
              : ""}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && !loading && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${label?.toLowerCase() || "options"}...`}
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute right-2 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <p className="text-xs text-gray-500 mt-1">
                  {filteredOptions.length} result
                  {filteredOptions.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                      option.value === value
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                    {option.value === value && (
                      <svg
                        className="inline-block ml-2 w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-sm text-gray-500">
                  No results found for &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
