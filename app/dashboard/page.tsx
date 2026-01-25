"use client";
import { useState, useEffect } from "react";
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
import SignatureComplianceChart from "@/components/charts/SignatureComplianceChart";
import SubjectPerformanceGrid from "@/components/charts/SubjectPerformanceGrid";

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

  // Study Pulse state
  const [studyPulseData, setStudyPulseData] = useState({
    pagesEntered: 0,
    totalQueries: 0,
    activeSubjects: 0,
    missingPages: 0,
    cleanCRFPercentage: 0,
  });
  const [loadingStudyPulse, setLoadingStudyPulse] = useState(true);

  // Country Performance state
  const [countryPerformanceData, setCountryPerformanceData] = useState<any[]>(
    [],
  );
  const [loadingCountryPerformance, setLoadingCountryPerformance] =
    useState(true);

  // Subject Performance state
  const [subjectPerformanceData, setSubjectPerformanceData] = useState<any[]>(
    [],
  );
  const [loadingSubjectPerformance, setLoadingSubjectPerformance] =
    useState(true);

  // SAE Chart state
  const [saeChartData, setSaeChartData] = useState<any[]>([]);
  const [loadingSAEChart, setLoadingSAEChart] = useState(true);

  // Signature Compliance state
  const [signatureComplianceData, setSignatureComplianceData] = useState<any[]>(
    [],
  );
  const [loadingSignatureCompliance, setLoadingSignatureCompliance] =
    useState(true);

  // Site Performance state
  const [sitePerformanceData, setSitePerformanceData] = useState<any[]>([]);
  const [loadingSitePerformance, setLoadingSitePerformance] = useState(true);

  // Subject Overview state
  const [subjectOverviewData, setSubjectOverviewData] = useState<any[]>([]);
  const [loadingSubjectOverview, setLoadingSubjectOverview] = useState(true);

  // Patient 360 state
  const [patient360Data, setPatient360Data] = useState<any>(null);
  const [loadingPatient360, setLoadingPatient360] = useState(false);

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

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }
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

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }
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
      } finally {
        setLoadingRegionalData(false);
      }
    };

    fetchRegionalDataEntry();
  }, [filters]);

  // Fetch Study Pulse data from API when filters change
  useEffect(() => {
    const fetchStudyPulse = async () => {
      try {
        setLoadingStudyPulse(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/study-pulse${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.metrics) {
          setStudyPulseData(result.metrics);
        }
      } catch (error) {
        console.error("Error fetching study pulse:", error);
        // Keep default values on error
      } finally {
        setLoadingStudyPulse(false);
      }
    };

    fetchStudyPulse();
  }, [filters]);

  // Fetch Country Performance data from API when filters change
  useEffect(() => {
    const fetchCountryPerformance = async () => {
      try {
        setLoadingCountryPerformance(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/country-performance${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.data) {
          setCountryPerformanceData(result.data);
        }
      } catch (error) {
        console.error("Error fetching country performance:", error);
      } finally {
        setLoadingCountryPerformance(false);
      }
    };

    fetchCountryPerformance();
  }, [filters]);

  // Fetch Subject Performance data from API when filters change
  useEffect(() => {
    const fetchSubjectPerformance = async () => {
      try {
        setLoadingSubjectPerformance(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/subject-performance${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.data) {
          setSubjectPerformanceData(result.data);
        }
      } catch (error) {
        console.error("Error fetching subject performance:", error);
        // Keep empty array on error
        setSubjectPerformanceData([]);
      } finally {
        setLoadingSubjectPerformance(false);
      }
    };

    fetchSubjectPerformance();
  }, [filters]);

  // Fetch SAE Chart data from API when filters change
  useEffect(() => {
    const fetchSAEChart = async () => {
      try {
        setLoadingSAEChart(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/sae-chart${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.data) {
          setSaeChartData(result.data);
        }
      } catch (error) {
        console.error("Error fetching SAE chart data:", error);
        // Set empty array on error
        setSaeChartData([]);
      } finally {
        setLoadingSAEChart(false);
      }
    };

    fetchSAEChart();
  }, [filters]);

  // Fetch Signature Compliance data from API when filters change
  useEffect(() => {
    const fetchSignatureCompliance = async () => {
      try {
        setLoadingSignatureCompliance(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const url = `/api/signature-compliance${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result && result.data) {
          setSignatureComplianceData(result.data);
        }
      } catch (error) {
        console.error("Error fetching signature compliance data:", error);
        // Set empty array on error
        setSignatureComplianceData([]);
      } finally {
        setLoadingSignatureCompliance(false);
      }
    };

    fetchSignatureCompliance();
  }, [filters]);

  // Fetch Site Performance data from API when filters change
  useEffect(() => {
    const fetchSitePerformance = async () => {
      try {
        setLoadingSitePerformance(true);
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

        const response = await fetch(`/api/site-performance?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch site performance data");
        }
        const data = await response.json();
        setSitePerformanceData(data);
      } catch (error) {
        console.error("Error fetching site performance data:", error);
        setSitePerformanceData([]);
      } finally {
        setLoadingSitePerformance(false);
      }
    };

    fetchSitePerformance();
  }, [filters]);

  // Fetch Subject Overview data from API when filters change
  useEffect(() => {
    const fetchSubjectOverview = async () => {
      try {
        setLoadingSubjectOverview(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const response = await fetch(`/api/subject-overview?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subject overview data");
        }
        const result = await response.json();
        setSubjectOverviewData(result.data || []);
      } catch (error) {
        console.error("Error fetching subject overview data:", error);
        setSubjectOverviewData([]);
      } finally {
        setLoadingSubjectOverview(false);
      }
    };

    fetchSubjectOverview();
  }, [filters]);

  // Fetch Patient 360 data when a subject is selected
  useEffect(() => {
    const fetchPatient360 = async () => {
      if (!selectedSubjectId) {
        setPatient360Data(null);
        return;
      }

      try {
        setLoadingPatient360(true);
        const params = new URLSearchParams();
        params.append("subjectId", selectedSubjectId);

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }

        const response = await fetch(`/api/patient-360?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch patient 360 data");
        }
        const data = await response.json();
        setPatient360Data(data);
      } catch (error) {
        console.error("Error fetching patient 360 data:", error);
        setPatient360Data(null);
      } finally {
        setLoadingPatient360(false);
      }
    };

    fetchPatient360();
  }, [selectedSubjectId, filters.studyId]);

  // Fetch Subject Overview data from API when filters change
  useEffect(() => {
    const fetchSubjectOverview = async () => {
      try {
        setLoadingSubjectOverview(true);
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
        if (filters.siteId !== "ALL") {
          params.append("siteId", filters.siteId);
        }
        if (filters.subjectId !== "ALL") {
          params.append("subjectId", filters.subjectId);
        }

        const response = await fetch(`/api/subject-overview?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subject overview data");
        }
        const result = await response.json();
        setSubjectOverviewData(result.data || []);
      } catch (error) {
        console.error("Error fetching subject overview data:", error);
        setSubjectOverviewData([]);
      } finally {
        setLoadingSubjectOverview(false);
      }
    };

    fetchSubjectOverview();
  }, [filters]);

  // Fetch Patient 360 data when a subject is selected
  useEffect(() => {
    const fetchPatient360 = async () => {
      if (!selectedSubjectId) {
        setPatient360Data(null);
        return;
      }

      try {
        setLoadingPatient360(true);
        const params = new URLSearchParams();
        params.append("subjectId", selectedSubjectId);

        if (filters.studyId !== "ALL") {
          params.append("study", filters.studyId);
        }

        const response = await fetch(`/api/patient-360?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch patient 360 data");
        }
        const data = await response.json();
        setPatient360Data(data);
      } catch (error) {
        console.error("Error fetching patient 360 data:", error);
        setPatient360Data(null);
      } finally {
        setLoadingPatient360(false);
      }
    };

    fetchPatient360();
  }, [selectedSubjectId, filters.studyId]);

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
                {loadingRegionalData || loadingSubjectPerformance ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                  </div>
                ) : filters.siteId !== "ALL" ? (
                  // When site is selected, show subject-level performance grid
                  <SubjectPerformanceGrid
                    data={subjectPerformanceData}
                    onSubjectClick={handleSubjectClick}
                  />
                ) : filters.country !== "ALL" ? (
                  // When country is selected (but not site), show site-level data (stacked bar)
                  <RegionStackedBarChart
                    data={regionalDataEntry}
                    syncId="dashboard"
                  />
                ) : filters.region !== "ALL" ? (
                  // When region is selected (but not country), show country performance
                  loadingCountryPerformance ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        Loading country performance...
                      </p>
                    </div>
                  ) : (
                    <CountryComposedChart
                      data={countryPerformanceData}
                      syncId="dashboard"
                    />
                  )
                ) : (
                  // When no region is selected, show regional data
                  <RegionStackedBarChart
                    data={regionalDataEntry}
                    syncId="dashboard"
                  />
                )}
              </div>

              {/* Right: Study Pulse Panel - 40% */}
              <div className="lg:col-span-2 h-full">
                <StudyPulse data={studyPulseData} loading={loadingStudyPulse} />
              </div>
            </section>

            {/* Charts Grid - 3 Column Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* SAE Donut Chart */}
              <div className="lg:col-span-1 flex">
                {loadingSAEChart ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Loading SAE data...</p>
                  </div>
                ) : (
                  <SAEDonutChart data={saeChartData} />
                )}
              </div>

              {/* Signature Compliance Chart - Spans 2 columns */}
              <div className="lg:col-span-2 flex">
                {loadingSignatureCompliance ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex items-center justify-center">
                    <p className="text-gray-500">
                      Loading signature compliance...
                    </p>
                  </div>
                ) : (
                  <SignatureComplianceChart data={signatureComplianceData} />
                )}
              </div>
            </section>

            {/* Site Performance Table */}
            {filters.siteId === "ALL" && (
              <section>
                {loadingSitePerformance ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
                      <div className="space-y-3">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : sitePerformanceData.length > 0 ? (
                  <SitePerformanceTable
                    data={sitePerformanceData}
                    onSiteClick={handleSiteClick}
                  />
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
                    <p className="text-gray-600">
                      No sites with signature backlog found
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Subject Table */}
            {loadingSubjectOverview ? (
              <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </section>
            ) : subjectOverviewData.length > 0 ? (
              <section>
                <SubjectTable
                  data={subjectOverviewData}
                  onSubjectClick={handleSubjectClick}
                />
              </section>
            ) : null}

            {/* Empty State */}
            {!loadingSubjectOverview && subjectOverviewData.length === 0 && (
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
                        subjectOverviewData.filter(
                          (s) => s.status === "On Trial",
                        ).length
                      }{" "}
                      subjects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>
                      High Risk:{" "}
                      {subjectOverviewData.filter((s) => s.isHighRisk).length}{" "}
                      subjects
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>
                      Discontinued:{" "}
                      {
                        subjectOverviewData.filter(
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
          data={patient360Data}
          onClose={() => setSelectedSubjectId(null)}
        />
      )}

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}
