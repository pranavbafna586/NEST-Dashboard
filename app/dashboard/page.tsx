"use client";

import React, { useState, useEffect } from "react";
import { FilterState, KPISummary } from "@/types";
import Sidebar from "@/components/dashboard/Sidebar";
import KPICards from "@/components/dashboard/KPICards";
import StudyPulse from "@/components/dashboard/StudyPulse";
import UploadDialog from "@/components/dashboard/UploadDialog";
import {
  SitePerformanceTable,
  SubjectTable,
} from "@/components/dashboard/DataTable";
import Patient360 from "@/components/dashboard/Patient360";
import Chatbot from "@/components/landing/Chatbot";
import RegionStackedBarChart from "@/components/charts/RegionStackedBarChart";
import CountryComposedChart from "@/components/charts/CountryComposedChart";
import SAEDonutChart from "@/components/charts/SAEDonutChart";
import CodingTreemap from "@/components/charts/CodingTreemap";
import {
  getKPISummary,
  getStatsByRegion,
  getSitePerformance,
  getSAEChartData,
  getCodingCategoryData,
  getCountryPerformance,
  filterMetrics,
  getSubjectDetails,
  masterMetrics,
} from "@/data/mockData";

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>({
    studyId: "ALL",
    region: "ALL",
    country: "ALL",
    siteId: "ALL",
    subjectId: "ALL",
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // KPI state
  const [kpiSummary, setKpiSummary] = useState<KPISummary>({
    totalMissingVisits: 0,
    openQueries: 0,
    seriousAdverseEvents: 0,
    uncodedTerms: 0,
  });
  const [loadingKPI, setLoadingKPI] = useState(true);

  // Regional Data Entry Progress state
  const [regionalDataEntry, setRegionalDataEntry] = useState<any[]>([]);
  const [loadingRegionalData, setLoadingRegionalData] = useState(true);

  // Update timestamp only on client side to avoid hydration errors
  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  // Fetch KPI data from API when filters change
  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoadingKPI(true);
        const params = new URLSearchParams();

        if (filters.region !== "ALL") {
          params.append("region", filters.region);
        }
        if (filters.country !== "ALL") {
          params.append("country", filters.country);
        }
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/kpi${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.summary) {
          setKpiSummary(data.summary);
        }
      } catch (error) {
        console.error("Error fetching KPI data:", error);
        // Fallback to mock data
        setKpiSummary(getKPISummary(filters));
      } finally {
        setLoadingKPI(false);
      }
    };

    fetchKPIData();
  }, [filters]);

  // Fetch Regional Data Entry Progress from API when filters change
  useEffect(() => {
    const fetchRegionalDataEntry = async () => {
      try {
        setLoadingRegionalData(true);
        const params = new URLSearchParams();

        if (filters.region !== "ALL") {
          params.append("region", filters.region);
        }
        if (filters.country !== "ALL") {
          params.append("country", filters.country);
        }
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/regional-data-entry${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.data) {
          setRegionalDataEntry(result.data);
        }
      } catch (error) {
        console.error("Error fetching regional data entry:", error);
        // Fallback to mock data
        setRegionalDataEntry(getStatsByRegion());
      } finally {
        setLoadingRegionalData(false);
      }
    };

    fetchRegionalDataEntry();
  }, [filters]);

  // Get all data based on current filters (keeping mock data for other components)
  const sitePerformance = getSitePerformance(filters);
  const saeData = getSAEChartData(filters);
  const codingData = getCodingCategoryData();
  const countryPerformance = getCountryPerformance(filters);
  const filteredSubjects = filterMetrics(filters);

  // Get patient 360 data if a subject is selected
  const patient360Data = selectedSubjectId
    ? getSubjectDetails(selectedSubjectId)
    : null;

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleSiteClick = (siteId: string) => {
    setFilters({
      ...filters,
      siteId,
      subjectId: "ALL",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        filters={filters}
        onFilterChange={setFilters}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Right Side Container */}
      <div className="flex-1 flex flex-col">
        {/* Header - Fixed at top */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-md shrink-0 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Clinical Trial Intelligence Engine
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time monitoring and analytics for Study 1
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUploadDialogOpen(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 transition-colors shadow-sm flex items-center gap-2"
              >
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload
              </button>
              <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 transition-colors shadow-sm">
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2 shadow-sm">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <section>
              <KPICards summary={kpiSummary} role={filters.role} />
            </section>

            {/* 60/40 Split: Regional Chart (60%) + Study Pulse (40%) */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
              {/* Left: Regional Data Entry Progress - 60% */}
              <div className="lg:col-span-3 h-full">
                {loadingRegionalData ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading regional data...</p>
                  </div>
                ) : filters.region === "ALL" ? (
                  <RegionStackedBarChart
                    data={regionalDataEntry}
                    syncId="dashboard"
                  />
                ) : (
                  <CountryComposedChart
                    data={regionalDataEntry}
                    syncId="dashboard"
                  />
                )}
              </div>

              {/* Right: Study Pulse Panel - 40% */}
              <div className="lg:col-span-2 h-full">
                <StudyPulse metrics={masterMetrics} studyId={filters.studyId} />
              </div>
            </section>

            {/* Charts Grid - 3 Column Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* SAE Donut Chart */}
              <div className="lg:col-span-1 flex">
                <SAEDonutChart data={saeData} />
              </div>

              {/* Coding Treemap */}
              <div className="lg:col-span-2 flex">
                <CodingTreemap data={codingData} />
              </div>
            </section>

            {/* Site Performance Table */}
            {filters.siteId === "ALL" && sitePerformance.length > 0 && (
              <section>
                <SitePerformanceTable
                  data={sitePerformance}
                  onSiteClick={handleSiteClick}
                />
              </section>
            )}

            {/* Subject Table */}
            {filteredSubjects.length > 0 && (
              <section>
                <SubjectTable
                  data={filteredSubjects}
                  onSubjectClick={handleSubjectClick}
                />
              </section>
            )}

            {/* Empty State */}
            {filteredSubjects.length === 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No data available
                </h3>
                <p className="text-sm text-gray-600">
                  Adjust your filters to view relevant data
                </p>
              </section>
            )}

            {/* Footer Info */}
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>
                      Active:{" "}
                      {
                        filteredSubjects.filter((s) => s.status === "On Trial")
                          .length
                      }{" "}
                      subjects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>
                      High Risk:{" "}
                      {filteredSubjects.filter((s) => s.isHighRisk).length}{" "}
                      subjects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>
                      Discontinued:{" "}
                      {
                        filteredSubjects.filter(
                          (s) => s.status === "Discontinued",
                        ).length
                      }{" "}
                      subjects
                    </span>
                  </div>
                </div>

                {/* Upload Dialog */}
                <UploadDialog
                  isOpen={uploadDialogOpen}
                  onClose={() => setUploadDialogOpen(false)}
                />
                <span>Last updated: {lastUpdated || "Loading..."}</span>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Patient 360 Modal */}
      {patient360Data && (
        <Patient360
          subject={patient360Data.subject}
          visits={patient360Data.visits}
          missingVisits={patient360Data.missingVisits}
          labs={patient360Data.labs}
          saes={patient360Data.saes}
          dataQualityScore={patient360Data.dataQualityScore}
          onClose={() => setSelectedSubjectId(null)}
        />
      )}

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}
