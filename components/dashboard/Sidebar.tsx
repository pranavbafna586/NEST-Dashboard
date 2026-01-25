"use client";

import React, { useState, useEffect } from "react";
import {
  FilterState,
  Region,
  ResponsibleFunction,
  ROLE_KPI_MAPPING,
} from "@/types";
import SearchableDropdown from "./SearchableDropdown";

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface Study {
  project_name: string;
}

interface Site {
  site_id: string;
}

export default function Sidebar({
  filters,
  onFilterChange,
  collapsed = false,
  onToggle,
}: SidebarProps) {
  // State for all dropdowns
  const [studies, setStudies] = useState<Study[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Loading states
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Fetch studies (independent - loads on mount)
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoadingStudies(true);
        const response = await fetch("/api/studies");
        const data = await response.json();
        if (data.studies) {
          setStudies(data.studies);
        }
      } catch (error) {
        console.error("Error fetching studies:", error);
      } finally {
        setLoadingStudies(false);
      }
    };

    fetchStudies();
  }, []);

  // Fetch regions (depends on study filter)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const url =
          filters.studyId !== "ALL"
            ? `/api/regions?study=${encodeURIComponent(filters.studyId)}`
            : "/api/regions";

        const response = await fetch(url);
        const data = await response.json();
        if (data.regions) {
          setRegions(data.regions);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, [filters.studyId]);

  // Fetch countries (depends on study and region filters)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const params = new URLSearchParams();

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }
        if (filters.region !== "ALL") {
          params.append("region", filters.region);
        }

        const url = `/api/countries${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.countries) {
          setCountries(data.countries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [filters.studyId, filters.region]);

  // Fetch sites (depends on study, region and country filters)
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoadingSites(true);
        const params = new URLSearchParams();

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }
        if (filters.region !== "ALL") {
          params.append("region", filters.region);
        }
        if (filters.country !== "ALL") {
          params.append("country", filters.country);
        }

        const url = `/api/sites${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.sites) {
          setSites(data.sites);
        }
      } catch (error) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoadingSites(false);
      }
    };

    fetchSites();
  }, [filters.studyId, filters.region, filters.country]);

  // Fetch subjects (depends on study, site, region, and country filters)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const params = new URLSearchParams();

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.region !== "ALL") {
          params.append("region", filters.region);
        }
        if (filters.country !== "ALL") {
          params.append("country", filters.country);
        }

        const url = `/api/subjects${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.subjects) {
          setSubjects(data.subjects);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [filters.studyId, filters.siteId, filters.region, filters.country]);

  const handleStudyChange = (studyId: string | "ALL") => {
    onFilterChange({
      studyId,
      region: "ALL",
      country: "ALL",
      siteId: "ALL",
      subjectId: "ALL",
      role: filters.role,
    });
  };

  const handleRegionChange = (region: Region | "ALL") => {
    onFilterChange({
      ...filters,
      region,
      country: "ALL",
      siteId: "ALL",
      subjectId: "ALL",
    });
  };

  const handleCountryChange = (country: string) => {
    onFilterChange({
      ...filters,
      country,
      siteId: "ALL",
      subjectId: "ALL",
    });
  };

  const handleSiteChange = (siteId: string) => {
    onFilterChange({
      ...filters,
      siteId,
      subjectId: "ALL",
    });
  };

  const handleSubjectChange = (subjectId: string) => {
    onFilterChange({
      ...filters,
      subjectId,
    });
  };

  const handleRoleChange = (role: ResponsibleFunction | undefined) => {
    onFilterChange({
      ...filters,
      role,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      studyId: "ALL",
      region: "ALL",
      country: "ALL",
      siteId: "ALL",
      subjectId: "ALL",
      role: filters.role,
    });
  };

  if (collapsed) {
    return (
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 transition-all duration-300 shadow-sm h-screen sticky top-0">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          title="Expand Sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="mt-8 space-y-4">
          <div
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"
            title="Region Filter"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
          </div>
          <div
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"
            title="Country Filter"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </div>
          <div
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"
            title="Site Filter"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"
            title="Subject Filter"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CTIE</h1>
              <p className="text-xs text-gray-600">
                Clinical Trial Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Study Filter - NEW: At the top */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Study
          </label>
          <SearchableDropdown
            value={filters.studyId}
            onChange={handleStudyChange}
            options={[
              { value: "ALL", label: "All Studies" },
              ...studies.map((study) => ({
                value: study.project_name,
                label: study.project_name,
              })),
            ]}
            placeholder="All Studies"
            disabled={loadingStudies}
            loading={loadingStudies}
            showCount={true}
          />
          {filters.studyId !== "ALL" && (
            <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Selected:</span>{" "}
                {filters.studyId}
              </p>
            </div>
          )}
        </div>

        {/* Role Filter - NEW */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Your Role (RBAC)
          </label>
          <div className="relative">
            <select
              value={filters.role || ""}
              onChange={(e) =>
                handleRoleChange(
                  e.target.value
                    ? (e.target.value as ResponsibleFunction)
                    : undefined,
                )
              }
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
            >
              <option value="">All Roles (No Filter)</option>
              {ROLE_KPI_MAPPING.map((roleConfig) => (
                <option key={roleConfig.role} value={roleConfig.role}>
                  {roleConfig.role}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
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
            </div>
          </div>
          {filters.role && (
            <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-700">
                <span className="font-semibold">Responsibility:</span>{" "}
                {
                  ROLE_KPI_MAPPING.find((r) => r.role === filters.role)
                    ?.primaryResponsibility
                }
              </p>
              <p className="text-xs text-purple-600 mt-1">
                KPIs filtered to show only critical metrics for this role
              </p>
            </div>
          )}
        </div>

        {/* Region Filter */}
        <SearchableDropdown
          value={filters.region}
          onChange={(value) => handleRegionChange(value as Region | "ALL")}
          options={[
            { value: "ALL", label: "All Regions" },
            ...regions.map((region) => ({
              value: region,
              label: region,
            })),
          ]}
          placeholder="All Regions"
          disabled={loadingRegions}
          loading={loadingRegions}
          label="Region"
          showCount={true}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
          }
        />

        {/* Country Filter */}
        <SearchableDropdown
          value={filters.country}
          onChange={handleCountryChange}
          options={[
            { value: "ALL", label: "All Countries" },
            ...countries.map((country) => ({
              value: country,
              label: country,
            })),
          ]}
          placeholder="All Countries"
          disabled={loadingCountries || countries.length === 0}
          loading={loadingCountries}
          label="Country"
          showCount={true}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          }
        />

        {/* Site Filter */}
        <SearchableDropdown
          value={filters.siteId}
          onChange={handleSiteChange}
          options={[
            { value: "ALL", label: "All Sites" },
            ...sites.map((site) => ({
              value: site.site_id,
              label: site.site_id,
            })),
          ]}
          placeholder="All Sites"
          disabled={loadingSites || sites.length === 0}
          loading={loadingSites}
          label="Site"
          showCount={true}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
        />

        {/* Subject Filter */}
        <SearchableDropdown
          value={filters.subjectId}
          onChange={handleSubjectChange}
          options={[
            { value: "ALL", label: "All Subjects" },
            ...subjects.map((subject) => ({
              value: subject,
              label: subject,
            })),
          ]}
          placeholder="All Subjects"
          disabled={loadingSubjects || subjects.length === 0}
          loading={loadingSubjects}
          label="Subject"
          showCount={true}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {/* Active Filters Display */}
        {(filters.region !== "ALL" ||
          filters.country !== "ALL" ||
          filters.siteId !== "ALL" ||
          filters.subjectId !== "ALL") && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Active Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {filters.region !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {filters.region}
                  <button
                    onClick={() => handleRegionChange("ALL")}
                    className="hover:text-blue-900"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
              {filters.country !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                  {filters.country}
                  <button
                    onClick={() => handleCountryChange("ALL")}
                    className="hover:text-emerald-900"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
              {filters.siteId !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  {filters.siteId}
                  <button
                    onClick={() => handleSiteChange("ALL")}
                    className="hover:text-amber-900"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
              {filters.subjectId !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {filters.subjectId}
                  <button
                    onClick={() => handleSubjectChange("ALL")}
                    className="hover:text-purple-900"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Study 1 Active</span>
        </div>
      </div>
    </aside>
  );
}
