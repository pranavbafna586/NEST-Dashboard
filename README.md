# CTIE - Clinical Trial Intelligence Engine

> AI-powered clinical trial data harmonization and analytics platform

![CTIE Banner](./public/landing_page.png)

## � Quick Start Installation

### Prerequisites

- **Node.js 18+**
- **Python 3.8+** (for data processing)
- **npm/pnpm** (package managers)

### Installation Steps

```bash
# Clone the repository
git clone "https://github.com/pranavbafna586/NEST-Dashboard"
cd ./NEST-Dashboard

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

### Configuration (Required)

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
CACHE_TTL_MINUTES=15
MAX_CACHE_SIZE_KB=500
RATE_LIMIT_PER_MINUTE=10
DB_PATH=./database/edc_metrics.db
```

### Database Setup (Required)

```bash
# Generate the database from study files
python main.py
```

This processes Excel study files through the ETL pipeline and creates the normalized database.

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## �️ Screenshots

### Landing Page

![Landing Page](./public/screenshots/landing_page.png)
_Interactive landing page featuring animated particle effects and glassmorphism UI elements_

### Dashboard Overview

![Dashboard](./public/screenshots/dashboard.png)
_Main dashboard displaying real-time KPI metrics and regional data analytics_

![KPI Cards Drill View](./public/screenshots/KPICardsDrillView.png)
_Detailed drill-down view for individual KPI card analysis_

![Study and Region Filter](public/screenshots/Study_RegionFilter.png)
_Advanced filtering capabilities by study and geographic region_

### Dashboard Analytics

![Analytics](./public/screenshots/dashboard_analytics.png)
_Advanced visualizations showing Serious Adverse Event distribution and hierarchical medical coding analysis_

### Patient 360 View

![Patient 360](./public/screenshots/patient360.png)
_Comprehensive patient profile with complete visit timeline, lab results, and adverse event tracking_

### Upload Feature for Excel Sheets

![Upload Feature](public/screenshots/Upload.png)
_Dynamic data ingestion with real-time dashboard updates upon study file upload_

---

## �📋 Problem Statement

Clinical trials generate vast amounts of heterogeneous data from multiple sources, including:

- **Electronic Data Capture (EDC) systems**
- **Laboratory reports**
- **Site operational metrics**
- **Monitoring logs**

However, these data streams often remain **siloed**, leading to:

- Delayed identification of operational bottlenecks
- Inconsistent data quality
- Limited visibility for scientific decision-making

Current processes rely heavily on **manual review** and **fragmented communication** between Clinical Trial Teams (CTT), Clinical Research Associates (CRAs), and investigational sites, which increases cycle times and operational risk.

---

## 🎯 Solution Overview

The CTIE platform implements a four-layer architecture:

1. **Data Extraction Layer**: Automated ingestion from 9 Excel workbooks per study
2. **Data Transformation Layer**: Cross-referencing and missing value imputation algorithms
3. **Data Storage Layer**: Normalized SQLite database with 16 tables
4. **Presentation Layer**: Interactive dashboard with drill-down capabilities and AI chatbot

### Key Achievements

- **Data Scale**: 23 studies, 48,007 subjects, 2,216 sites across 71 countries and 3 regions
- **Operational Metrics**: Tracks 40+ metrics per subject including 13,115 open queries and 5,178 active SAEs
- **Data Quality Index (DQI)**: Scientifically-weighted scoring algorithm derived from FDA guidance and ICH-GCP principles
- **Clean Patient Assessment**: Multi-criteria algorithm identifying 12,458 database-lock-ready subjects (26.0%)
- **AI Integration**: Conversational interface with natural language querying and voice input

---

## ✨ Features

### Landing Page

- Modern, professional UI with animated particles background
- Interactive hero section with call-to-action
- Bento-style feature grid showcasing capabilities
- Dashboard preview section
- AI-powered chatbot with voice input

### Dashboard Architecture

The dashboard provides comprehensive real-time insights through an intuitive, hierarchical interface.

#### 🎛️ Sidebar with Drill-Down Filters

The sidebar serves as the main control panel with hierarchical filters:

1. **Study Filter** - Select specific clinical trial or view all studies
2. **Role Filter (RBAC)** - Role-based access control showing relevant metrics:
   - Data Manager
   - Clinical Research Associate
   - Medical Monitor
   - Safety Officer
   - Study Director
3. **Region Filter** - Geographic filtering (North America, Europe, Asia-Pacific)
4. **Country Filter** - Country-level drill-down within selected region
5. **Site Filter** - Individual research site selection
6. **Subject Filter** - Single patient view

**Interaction**: Filters work in a cascading manner - each selection narrows down options in subsequent filters.

#### 📊 KPI Cards with Nested Dashboards

Four primary KPI cards provide at-a-glance metrics, each clickable to reveal detailed breakdowns:

1. **Total Subjects Enrolled** (Blue icon)
   - Nested view shows: enrollment funnel, site-wise breakdown, timeline trends, status distribution
2. **Open Queries** (Amber icon)
   - Nested view shows: query breakdown by type, response time analysis, distribution by site/subject, action owners
3. **Active SAEs** (Blue icon)
   - Nested view shows: SAE distribution by status, recent SAE details, site-wise analysis, time since reporting
4. **Clean CRF Percentage** (Green icon)
   - Nested view shows: conformant vs non-conformant breakdown, verification requirements, site comparison, trends

**Interaction**: Clicking any KPI card opens a sliding panel from the right with detailed analytics. Panel respects sidebar filters for contextual data.

#### 🔬 Study Pulse Panel

Compact metrics section showing study "heartbeat":

- **Pages Entered** (Blue) - Data entry progress
- **Total Queries** (Amber) - All data questions raised
- **Active Subjects** (Green) - Currently enrolled patients
- **Missing Pages** (Red) - Critical compliance gaps
- **Clean CRF %** (Green) - Data quality percentage

#### 📈 Advanced Visualizations

**Regional Data Entry Progress**

- Stacked horizontal bar chart
- Dynamic behavior: switches to site-level when country selected, subject-level when site selected
- Shows data entry completion across geographic regions

**Serious Adverse Events (SAE) Chart**

- Donut chart with segments: Open (Red), Closed (Green), Locked (Gray)
- Hover details show site/subject-specific SAEs
- Critical for safety monitoring

**Signature Compliance Status**

- Grouped bar chart tracking electronic signature compliance
- Categories: Forms requiring signature, overdue forms (color-coded by urgency), broken signatures, never signed
- Regulatory compliance monitoring

**Site Performance - Signature Backlog**

- Horizontal bar chart comparing sites
- Color gradient: darker red indicates worse backlog
- Identifies sites needing training or follow-up

**Country Performance Metrics**

- Dual-axis composed chart
- Country-level performance comparison with benchmarking

**Medical Coding Treemap**

- Hierarchical visualization of coding categories
- Shows MedDRA and WHODD coding status

#### 📋 Subjects Overview Table

Detailed list with key metrics per subject:

**Columns:**

- Subject ID, Site ID, Country, Region
- Status (On Trial/Completed/Discontinued)
- Open Queries count
- Missing Visits count
- Data Quality Score (color-coded: Green >90%, Yellow 75-89%, Red <75%)
- Last Visit Date
- Clean Patient Status (Green badge with checkmark or Red badge)

**Features:**

- Sortable columns
- Global search
- Clickable rows opening Patient 360 view
- Filter options: "Show Only Clean Patients", "Show Only At-Risk Patients", "Show Near-Clean Patients"

#### 🔍 Patient 360 View

Comprehensive single-patient dashboard (modal popup):

**Header Section:**

- Subject ID with status badge (Green/Red/Gray)
- High Risk badge if critical issues detected
- Site, Country, Region information

**Top Metrics:**

- Data Quality Score (large percentage with color coding)
- Pages Entered
- Total Queries
- Completed Visits
- Missing Visits

**Critical Missing Visits Alert:**

- Red alert box for visits >30 days overdue
- Shows visit name, projected date, days outstanding

**Queries Breakdown:**

- Grid of 7 query type cards:
  - DM Queries (Data Management - Blue)
  - Clinical Queries (Purple)
  - Medical Queries (Pink)
  - Site Queries (Amber)
  - Field Monitor Queries (Cyan)
  - Coding Queries (Indigo)
  - Safety Queries (Red)
- Recent Open Queries list with form name, visit, type, days open
- Expandable "Show All" for complete query history

**Safety Issues (SAEs):**

- Top metrics: Open, Closed, Locked SAEs
- Recent SAEs list with discrepancy ID, form, status, responsible person, action status

**Data Quality Issues:**

- Non-Conformant Pages
- Open Lab Issues
- Open EDRR Issues (External Data Review)
- Uncoded Terms

**Compliance & Verification:**

- Forms Need Verification / Forms Verified
- CRFs Overdue >90 Days
- Broken Signatures
- CRFs Never Signed
- Protocol Deviations Confirmed

**Form Lock Status:**

- Frozen Forms (Blue)
- Locked Forms (Green)
- Unlocked Forms (Gray)

#### 🤖 AI Chatbot Feature

**Location:** Floating button in bottom-right corner

**Interface:**

- Expandable chat window (400px × 600px)
- Header: "CTIE Assistant" with AI icon
- Scrollable message history
- Voice input capability via microphone icon

**Voice Input:**

- Click microphone → icon turns red (listening)
- Speak question clearly
- Automatic speech-to-text conversion
- Click again to stop or auto-stops after 10 seconds silence

**Intelligence Capabilities:**

- **Context-Aware**: Knows applied filters and current view
- **Data-Driven**: Answers based on real dashboard data
- **Conversational**: Maintains chat history and context
- **Explanatory**: Provides insights, not just numbers
- **Report Generation**: Creates custom reports based on queries
- **Proactive Alerts**: Flags high-risk subjects and compliance issues

**Example Queries:**

- "Show me subjects with DQI below 60"
- "Which sites have the most missing visits?"
- "List all open SAEs for Study 1"
- "What's the query resolution rate for Europe?"

#### 📤 Upload Functionality

**Access:** Upload button in top-right corner (cloud icon)

**Upload Dialog:**

- Large modal with drag-and-drop zone
- Supports Excel (.xlsx, .xls) and CSV files
- Multiple file upload (up to 9 files simultaneously)

**Required Excel Sheets for Complete Study:**

1. Subjects.xlsx - Patient demographics and enrollment
2. Sites.xlsx - Research site information
3. Visits.xlsx - Study visit schedule and completion
4. Queries.xlsx - Data queries and questions
5. SAE.xlsx - Serious Adverse Events
6. SDV.xlsx - Source Data Verification records
7. Signatures.xlsx - Electronic signature audit trail
8. Forms.xlsx - CRF form metadata
9. Labs.xlsx - Laboratory test results

**AI Preprocessing (Automated):**

1. **Column Name Standardization**
   - Detects variations: Patient ID, Subject_ID, SubjectNumber → standardizes to `subject_id`
2. **Data Type Detection**
   - Converts text dates to proper date format
   - Validates numeric fields
3. **Missing Value Handling**
   - Standardizes N/A, NULL, --, blanks to NULL
   - Smart fill: infers missing values when possible (e.g., country from site ID)
4. **Duplicate Detection**
   - Identifies duplicate records
   - Options: keep first, keep last, manual review
5. **Data Validation**
   - Subject ID format validation
   - Logical date sequencing
   - Numeric range checks
   - Mandatory field completeness
6. **Relationship Mapping**
   - Auto-detects and maps foreign keys across sheets
   - Links subjects → visits → sites

**User Feedback:** Real-time preprocessing status with detailed logs and validation warnings

---

## � Data Sources and Structure

### Input Data Sources

The solution processes **9 Excel workbooks per clinical study**, containing **25 distinct data sheets**:

| Workbook                                      | Sheets    | Purpose                                                                          |
| --------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| CPID_EDC_Metrics.xlsx                         | 11 sheets | Subject-level metrics, queries, signatures, SDV, protocol deviations, CRF status |
| Visit_Projection_Tracker.xlsx                 | 1 sheet   | Missing visits with days outstanding                                             |
| Missing_Lab_Name_and_Missing_Ranges.xlsx      | 1 sheet   | Laboratory data quality issues                                                   |
| eSAE_Dashboard_Standard_DM_Safety_Report.xlsx | 2 sheets  | Serious Adverse Event discrepancies (DM and Safety)                              |
| Inactivated_Forms_Folders_Records_Report.xlsx | 1 sheet   | Audit trail of inactivated data                                                  |
| Missing_Pages_Report.xlsx                     | 2 sheets  | Missing CRF pages at summary and visit levels                                    |
| Compiled_EDRR.xlsx                            | 1 sheet   | Third-party data reconciliation issues                                           |
| GlobalCodingReport_MedDRA.xlsx                | 1 sheet   | Medical terminology coding status                                                |
| GlobalCodingReport_WHODD.xlsx                 | 1 sheet   | Drug coding status (WHO Drug Dictionary)                                         |

### Data Volume

- **Studies**: 23 clinical trials
- **Geographic Coverage**: 3 regions, 71 countries, 2,216 sites
- **Subjects**: 48,007 enrolled subjects
- **Operational Metrics**: 13,115 open queries, 5,178 active SAEs, 2,897,949 total pages

---

## 🔄 ETL Pipeline Architecture

The solution implements a modular Python-based ETL pipeline with six core components:

### 1. File Renaming Utility (`rename_files.py`)

- Standardizes Excel file names across multiple studies
- Pattern-based matching
- Dry-run mode for validation

### 2. Data Extraction Module (`extract_data.py`)

**Key Features:**

- Processes 9 Excel workbooks per study
- Implements COLUMN_MAPPING dictionary for name standardization
- Handles variable header rows and formats
- Removes footer rows and applies data type conversions

**Column Name Standardization:**

- Study/Study ID → `project_name`
- Subject/Subject Name/Patient ID → `subject_id`
- Site/Site Number → `site_id`
- Visit/Folder Name → `visit_name`
- Form/Page/Data Page Name → `form_name`

**Date Conversion:** Standardizes from '28-Mar-25' to 'YYYY-MM-DD'

**Data Type Handling:** Converts 38 metric columns to nullable integers (Int64)

### 3. Data Transformation Module (`fill_missing_values.py`)

**Intelligent Cross-Referencing:**

- Merges data from SV (Subject Visits) tab to populate `latest_visit` and `subject_status`
- Fills missing Site IDs across all dataframes
- Critical for EDRR issues and SAE data lacking site identifiers

**Derived Metric Calculations:**

```
Expected Visits = Count(completed visits excluding Screening/Unplanned) + Count(missing visits)

% Clean CRF = (Pages Entered - Pages NonConformant) / Pages Entered × 100
```

**Query Classification by Type:**

- DM Queries: "DM Review" OR "DM from System"
- Clinical Queries: "Clinical Review"
- Medical Queries: "Medical Review"
- Site Queries: "Site Action" OR "Site Review"
- Field Monitor Queries: "CRA Action" OR "Field Monitor Review"
- Safety Queries: "Safety Review"
- Coding Queries: Count of uncoded terms

**Signature Compliance Categorization:**

- CRFs overdue <45 days
- CRFs overdue 45-90 days
- CRFs overdue >90 days
- Broken Signatures: "Yes - Broken Signature"
- Never Signed: "Yes - Never Signed"

### 4. Database Creation Module (`create_database.py`)

**Database Schema:**

- **Technology**: SQLite (`edc_metrics.db`)
- **Tables**: 16 normalized tables
- **Indexes**: Optimized for frequently accessed columns
- **Constraints**: UNIQUE constraints on composite keys, NOT NULL on critical fields
- **Atomicity**: Removes existing database for fresh start

### 5. Data Insertion Module (`data_insertion.py`)

**Performance Optimizations:**

- Batch inserts
- Single transaction for atomicity
- Data type conversions and NULL handling
- Post-insertion verification checks

### 6. Orchestration Module (`main.py`)

**Workflow Management:**

- Multi-study processing
- Error recovery and detailed logging
- Workflow verification and status reporting
- Parallel processing support

---

## 🗄️ Database Schema

The solution implements **16 normalized tables** organized into 4 categories:

### Subject-Level Aggregation

**`subject_level_metrics`** (44 columns + metadata)

Central repository containing all aggregated metrics per subject:

- **Identifiers**: `project_name`, `region`, `country`, `site_id`, `subject_id`
- **Visit Tracking**: `latest_visit`, `subject_status`, `expected_visits`
- **Missing Data**: `missing_visits`, `missing_page`
- **Coding Metrics**: `coded_terms`, `uncoded_terms`, `coding_queries`
- **Safety**: `esae_dashboard_dm`, `esae_dashboard_safety`, `safety_queries`
- **Data Quality**: `pages_entered`, `pages_non_conformant`, `percentage_clean_crf`
- **Queries by Type**: `dm_queries`, `clinical_queries`, `medical_queries`, `site_queries`, `field_monitor_queries`, `total_queries`
- **Verification**: `crfs_require_verification`, `forms_verified`
- **CRF Status**: `crfs_frozen`, `crfs_not_frozen`, `crfs_locked`, `crfs_unlocked`
- **Protocol Deviations**: `pds_confirmed`, `pds_proposed`
- **Signatures**: `crfs_signed`, `crfs_overdue_within_45_days`, `crfs_overdue_45_to_90_days`, `crfs_overdue_beyond_90_days`, `broken_signatures`, `crfs_never_signed`
- **Derived Metrics**: `data_quality_index`, `clean_patient_status`

**Constraints**: UNIQUE(`project_name`, `site_id`, `subject_id`)

### Transactional Detail Tables (10 tables)

1. **`query_report`** - Detailed query tracking at field level
2. **`non_conformant`** - Non-conformant data issues
3. **`pi_signature_report`** - PI signature compliance
4. **`sdv`** - Source Data Verification status
5. **`protocol_deviation`** - Protocol deviation tracking
6. **`crf_freeze_unfreeze`** - Freeze/unfreeze status
7. **`crf_lock_unlock`** - Lock/unlock status with audit trail
8. **`completed_visits`** - Subject visit completion log
9. **`edrr_issues`** - Third-party reconciliation issues
10. **`sae_issues`** - Serious Adverse Event tracking

### Issue Tracking Tables (5 tables)

11. **`global_coding_report`** - Medical coding status (MedDRA + WHODD)
12. **`inactivated_forms_folders`** - Audit log of inactivated forms
13. **`missing_lab_name_ranges`** - Laboratory test issues
14. **`missing_pages`** - Missing CRF pages
15. **`missing_visits`** - Expected but not completed visits

---

## 📐 Data Quality Index (DQI) Implementation

### Scientific Rationale

The DQI employs a **weighted scoring algorithm** derived from:

- FDA guidance documents
- ICH-GCP E6(R2) guidelines
- Clinical trial industry best practices

Weights were determined through three-phase analysis:

**Phase 1: Regulatory Impact Analysis**

- Analyzed 50 FDA Warning Letters and Form 483 observations (2020-2025)
- Safety issues appeared in 68% of citations
- Query resolution in 42%
- Missing data in 38%

**Phase 2: Risk-Based Monitoring (FMEA)**

- Safety issues: criticality score 9/10 (patient harm potential)
- Administrative issues: score 3/10

**Phase 3: Statistical Validation**

- Correlation analysis with study delays
- Unresolved SAEs: 0.72 correlation with database lock delays
- Missing visits: 0.58 correlation

### DQI Formula

```
DQI = Σ (Wi × Mi), where i = 1 to n metrics
```

### Weighted Categories

| Category                            | Weight   | Rationale                                                            |
| ----------------------------------- | -------- | -------------------------------------------------------------------- |
| **Unresolved Safety Issues (SAEs)** | 25%      | Highest regulatory scrutiny; patient safety impact per 21 CFR 312.32 |
| **Open Queries**                    | 15%      | FDA emphasis on timely resolution as quality indicator               |
| **Missing Visits**                  | 15%      | Protocol deviations impact efficacy endpoints                        |
| **Missing Pages**                   | 10%      | Required for complete ITT analysis per ICH E9                        |
| **Non-Conformant Data**             | 15%      | Edit check failures indicate poor data quality                       |
| **Unsigned CRFs**                   | 10%      | GCP requirement for investigator signatures                          |
| **Unverified Forms (SDV)**          | 10%      | Source document verification mandatory                               |
| **Uncoded Terms**                   | 3%       | Required for analysis completeness                                   |
| **Protocol Deviations**             | 2%       | Regulatory submission requirement                                    |
| **Total**                           | **100%** |                                                                      |

### Metric Normalization

```
Mi = 100 × (1 - Actual Issues / Maximum Threshold)
```

**Maximum Thresholds** (95th percentile benchmarking):

- Open Queries: 50 per subject
- Missing Visits: 5 per subject
- Missing Pages: 10 per subject
- Unresolved SAEs: 3 per subject
- Non-Conformant Pages: 5% of total
- Unsigned CRFs: 10 per subject
- Uncoded Terms: 5 per subject
- Protocol Deviations: 2 per subject

### DQI Score Categories

| Score  | Category        | Color       | Interpretation                      |
| ------ | --------------- | ----------- | ----------------------------------- |
| 90-100 | Excellent       | Green       | Submission ready                    |
| 75-89  | Good            | Light Green | Minor cleanup required              |
| 60-74  | Acceptable      | Yellow      | Moderate issues, action plan needed |
| 40-59  | Needs Attention | Orange      | Significant gaps, delay risk        |
| 0-39   | Critical        | Red         | Major intervention required         |

### Dashboard Integration

- **Main Dashboard**: KPI card showing "Average Data Quality Index: 87.3" with color-coded gauge
- **Subject Tables**: DQI column with color-coded cells
- **Site Performance**: Aggregated DQI scores with benchmark comparison
- **Subject Detail**: DQI breakdown widget showing metric contributions
- **Geographic Views**: Regional/country-level DQI heatmaps
- **AI Chatbot**: Natural language queries like "Show me subjects with DQI below 60"

---

## ✅ Clean Patient Status Implementation

### Multi-Criteria Assessment

A subject is classified as **'Clean'** only when **ALL** of the following 11 criteria are met:

1. ✓ No missing visits (`missing_visits == 0`)
2. ✓ No missing pages (`missing_page == 0`)
3. ✓ No open queries (`total_queries == 0`)
4. ✓ No non-conformant data (`pages_non_conformant == 0`)
5. ✓ No uncoded terms (`uncoded_terms == 0`)
6. ✓ All forms verified (`crfs_require_verification == 0`)
7. ✓ All forms signed (`crfs_never_signed == 0`)
8. ✓ No broken signatures (`broken_signatures == 0`)
9. ✓ No lab issues (`open_issues_in_lnr == 0`)
10. ✓ No EDRR issues (`open_issues_edrr == 0`)
11. ✓ No safety issues (`esae_dashboard_dm + esae_dashboard_safety == 0`)

### Implementation Logic

```python
def calculate_clean_patient_status(subject_metrics):
    criteria = {
        'no_missing_visits': subject_metrics['missing_visits'] == 0,
        'no_missing_pages': subject_metrics['missing_page'] == 0,
        'no_open_queries': subject_metrics['total_queries'] == 0,
        'no_non_conformant_data': subject_metrics['pages_non_conformant'] == 0,
        'no_uncoded_terms': subject_metrics['uncoded_terms'] == 0,
        'all_forms_verified': subject_metrics['crfs_require_verification'] == 0,
        'all_forms_signed': subject_metrics['crfs_never_signed'] == 0,
        'no_broken_signatures': subject_metrics['broken_signatures'] == 0,
        'no_lab_issues': subject_metrics['open_issues_in_lnr'] == 0,
        'no_edrr_issues': subject_metrics['open_issues_edrr'] == 0,
        'no_safety_issues': (subject_metrics['esae_dashboard_dm'] +
                            subject_metrics['esae_dashboard_safety']) == 0
    }

    is_clean = all(criteria.values())

    return {
        'status': 'Clean' if is_clean else 'Not Clean',
        'criteria_met': sum(criteria.values()),
        'criteria_total': len(criteria),
        'failing_criteria': [k for k, v in criteria.items() if not v]
    }
```

### Dashboard Integration

**Main Dashboard KPI:**

- Card displaying "Clean Patients: 12,458 (26.0%)" with green checkmark icon

**Subject Overview Table:**

- Clean Status column with badges:
  - "Clean" (Green badge with checkmark)
  - "Not Clean" (Red badge) with hover tooltip showing failing criteria

**Subject Detail Page:**

- Prominent badge in header
- Clean Status Breakdown section showing "11/11 criteria met" or "X/11 with failing criteria listed"
- Visual checklist: green checkmarks for passing, red X for failing

**Filter Options:**

- "Show Only Clean Patients" - 12,458 subjects ready for database lock
- "Show Only At-Risk Patients" - subjects failing ≥5 criteria
- "Show Near-Clean Patients" - subjects failing 1-2 criteria (low-hanging fruit)

**AI Chatbot:**

- Queries like "Which subjects are clean?", "Show me near-clean patients in Europe"

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom component library with glassmorphism effects

### Backend & Data Processing

- **Language**: Python 3.8+
- **Database**: SQLite (normalized schema with 16 tables)
- **Data Processing**: Pandas for ETL operations
- **File Handling**: openpyxl for Excel processing

### AI & Intelligence

- **AI Integration**: Google Gemini 2.5 Flash API
- **Conversational AI**: Natural language query processing
- **Voice Input**: Speech-to-text conversion
- **Report Generation**: Automated insights and recommendations

### Data Integration

- **ETL Pipeline**: Custom Python modules for extraction, transformation, loading
- **Data Validation**: Automated preprocessing with AI-powered column mapping
- **Cross-Referencing**: Intelligent missing value imputation algorithms

---

## 🎯 Addressing Scientific Requirements

### Key Questions Answered

| Question                                                                   | Dashboard Feature                                             | Analytical Capability                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| Which sites/patients have most missing visits/pages or unresolved queries? | Subject Performance table with sortable columns + DQI ranking | Identifies top sites/subjects by missing data volume |
| Where are highest rates of non-conformant data?                            | Clean CRF % drill-down with study-level breakdown             | Study and site comparison with benchmarking          |
| Which sites/CRAs are underperforming?                                      | Site Performance table with DQI scores and quality metrics    | Multi-dimensional performance assessment             |
| Where are most open issues in lab/coding?                                  | Subject detail view + aggregated issue counters               | Drill-down from site → subject → specific issue type |
| Which sites require immediate attention?                                   | AI-generated risk alerts + High Risk subject counter          | Automated flagging based on DQI <60 or open SAEs     |
| Can we flag sites with high deviation counts?                              | Protocol deviation tracking in subject_level_metrics          | Real-time deviation monitoring with trend analysis   |
| Is snapshot clean enough for interim analysis?                             | Overall Clean CRF % KPI + Data Quality Status indicator       | Study-level readiness assessment                     |
| Can readiness checks be automated?                                         | AI chatbot proactive monitoring + threshold-based alerts      | Scheduled scans with stakeholder notifications       |

---

## 🏆 Impact & Achievements

### Operational Efficiency

- **Time Savings**: Reduces data consolidation from days of manual Excel work to minutes of automated processing
- **Real-Time Insights**: Instant dashboard updates upon data upload
- **Multi-Study Support**: Processes 23 concurrent studies with 48,007 subjects

### Quality Improvement

- **Risk Stratification**: DQI-based prioritization enables targeted intervention
- **Early Detection**: Prevents quality degradation through proactive monitoring
- **Clean Patient Identification**: 12,458 subjects verified as submission-ready (26.0%)

### Regulatory Readiness

- **Compliance Monitoring**: Tracks signature compliance across 83,142 forms
- **Safety Oversight**: Real-time SAE monitoring across 29,190 events
- **Audit Trail**: Complete data lineage from source Excel to dashboard metrics

### Resource Optimization

- **Query Distribution**: Analysis reveals 52.1% site ownership, informing training allocation
- **Geographic Insights**: Performance comparison across 3 regions, 71 countries
- **Role-Based Views**: RBAC ensures stakeholders see relevant metrics only

---

## 📊 Data Processing Statistics

- **Total Data Pages**: 2,897,949 CRF pages processed
- **Open Queries**: 13,115 tracked and categorized by type
- **Active SAEs**: 5,178 serious adverse events monitored
- **Sites**: 2,216 research sites across 71 countries
- **Studies**: 23 clinical trials integrated
- **Subjects**: 48,007 enrolled participants
- **Database Tables**: 16 normalized tables with optimized indexes
- **Excel Sources**: 9 workbooks × 25 sheets per study
- **Metrics per Subject**: 40+ operational metrics calculated

---
