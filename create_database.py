import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

# Database file path
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

def create_database():
    """Create SQLite database and all required tables (if they don't exist)"""
    
    # Check if database exists
    db_exists = os.path.exists(DB_PATH)
    
    if db_exists:
        print(f"Database already exists: {DB_PATH}")
        print("Creating tables if they don't exist (existing data will be preserved)...")
    else:
        print(f"Creating new database: {DB_PATH}")
    
    # Create connection
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1) Subject Level Metrics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subject_level_metrics (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            latest_visit TEXT,
            subject_status TEXT,
            missing_visits INTEGER DEFAULT 0,
            missing_page INTEGER DEFAULT 0,
            coded_terms INTEGER DEFAULT 0,
            uncoded_terms INTEGER DEFAULT 0,
            open_issues_in_lnr INTEGER DEFAULT 0,
            open_issues_edrr INTEGER DEFAULT 0,
            inactivated_forms_folders INTEGER DEFAULT 0,
            esae_dashboard_dm INTEGER DEFAULT 0,
            esae_dashboard_safety INTEGER DEFAULT 0,
            expected_visits INTEGER DEFAULT 0,
            pages_entered INTEGER DEFAULT 0,
            pages_non_conformant INTEGER DEFAULT 0,
            crfs_with_queries_nc INTEGER DEFAULT 0,
            crfs_without_queries_nc INTEGER DEFAULT 0,
            percentage_clean_crf REAL DEFAULT 0.0,
            dm_queries INTEGER DEFAULT 0,
            clinical_queries INTEGER DEFAULT 0,
            medical_queries INTEGER DEFAULT 0,
            site_queries INTEGER DEFAULT 0,
            field_monitor_queries INTEGER DEFAULT 0,
            coding_queries INTEGER DEFAULT 0,
            safety_queries INTEGER DEFAULT 0,
            total_queries INTEGER DEFAULT 0,
            crfs_require_verification INTEGER DEFAULT 0,
            forms_verified INTEGER DEFAULT 0,
            crfs_frozen INTEGER DEFAULT 0,
            crfs_not_frozen INTEGER DEFAULT 0,
            crfs_locked INTEGER DEFAULT 0,
            crfs_unlocked INTEGER DEFAULT 0,
            pds_confirmed INTEGER DEFAULT 0,
            pds_proposed INTEGER DEFAULT 0,
            crfs_signed INTEGER DEFAULT 0,
            crfs_overdue_within_45_days INTEGER DEFAULT 0,
            crfs_overdue_45_to_90_days INTEGER DEFAULT 0,
            crfs_overdue_beyond_90_days INTEGER DEFAULT 0,
            broken_signatures INTEGER DEFAULT 0,
            crfs_never_signed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_name, site_id, subject_id)
        )
    """)
    print("Created table: subject_level_metrics")
    
    # 2) Query Report
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS query_report (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            field_oid TEXT,
            logline TEXT,
            visit_date DATE,
            query_status TEXT,
            action_owner TEXT,
            marking_group_name TEXT,
            query_open_date DATE,
            query_response_date DATE,
            days_since_open INTEGER,
            days_since_response INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: query_report")
    
    # 3) Non Conformant
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS non_conformant (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            logline TEXT,
            field_oid TEXT,
            audit_time TIMESTAMP,
            visit_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: non_conformant")
    
    # 4) PI Signature Report
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pi_signature_report (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            page_require_signature TEXT,
            audit_action TEXT,
            visit_date DATE,
            date_page_entered DATE,
            no_of_days INTEGER,
            pending_since TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: pi_signature_report")
    
    # 5) SDV
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sdv (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            visit_date DATE,
            verification_status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: sdv")
    
    # 6) Protocol Deviation
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS protocol_deviation (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            logline TEXT,
            pd_status TEXT,
            visit_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: protocol_deviation")
    
    # 7) CRF Freeze UnFreeze (combined)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crf_freeze_unfreeze (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            form_name TEXT,
            freeze_status TEXT,
            visit_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: crf_freeze_unfreeze")
    
    # 8) CRF Lock UnLocked (combined)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crf_lock_unlock (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            form_name TEXT,
            lock_status TEXT,
            audit_user TEXT,
            visit_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: crf_lock_unlock")
    
    # 9) Completed Visits (from SV)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS completed_visits (
            project_name TEXT NOT NULL,
            region TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            visit_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: completed_visits")
    
    # 10) EDRR Issues
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS edrr_issues (
            project_name TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            total_open_issue_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_name, subject_id)
        )
    """)
    print("Created table: edrr_issues")
    
    # 11) SAE Issues (combined DM and Safety with Responsible LF column)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sae_issues (
            discrepancy_id TEXT,
            project_name TEXT NOT NULL,
            country TEXT,
            site_id TEXT,
            subject_id TEXT NOT NULL,
            form_name TEXT,
            case_status TEXT,
            discrepancy_created_timestamp TEXT,
            review_status TEXT,
            action_status TEXT,
            responsible_lf TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: sae_issues")
    
    # 12) Global Coding Report (combined MedDRA and WHODD with Report Type column)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS global_coding_report (
            project_name TEXT NOT NULL,
            report_type TEXT NOT NULL,
            dictionary TEXT,
            dictionary_version TEXT,
            subject_id TEXT NOT NULL,
            form_oid TEXT,
            logline TEXT,
            field_oid TEXT,
            coding_status TEXT,
            require_coding TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: global_coding_report")
    
    # 13) Inactivated Forms Folders
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inactivated_forms_folders (
            project_name TEXT NOT NULL,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            data_on_form TEXT,
            record_position TEXT,
            audit_action TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: inactivated_forms_folders")
    
    # 14) Missing Lab Name and Ranges
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS missing_lab_name_ranges (
            project_name TEXT NOT NULL,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            lab_category TEXT,
            lab_date DATE,
            test_name TEXT,
            test_description TEXT,
            issue TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: missing_lab_name_ranges")
    
    # 15) Missing Pages (with Page Type column)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS missing_pages (
            project_name TEXT NOT NULL,
            page_type TEXT,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            form_name TEXT,
            visit_date DATE,
            subject_status TEXT,
            days_missing INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: missing_pages")
    
    # 16) Missing Visits
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS missing_visits (
            project_name TEXT NOT NULL,
            country TEXT,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            visit_name TEXT,
            projected_date DATE,
            days_outstanding INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created table: missing_visits")
    
    # 17) Subject DQI and Clean Status
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subject_dqi_clean_status (
            project_name TEXT NOT NULL,
            site_id TEXT NOT NULL,
            subject_id TEXT NOT NULL,
            dqi_score REAL DEFAULT 0.0,
            dqi_category TEXT,
            norm_safety_issues REAL DEFAULT 0.0,
            norm_open_queries REAL DEFAULT 0.0,
            norm_missing_visits REAL DEFAULT 0.0,
            norm_missing_pages REAL DEFAULT 0.0,
            norm_non_conformant REAL DEFAULT 0.0,
            norm_unsigned_crfs REAL DEFAULT 0.0,
            norm_unverified_forms REAL DEFAULT 0.0,
            norm_uncoded_terms REAL DEFAULT 0.0,
            norm_protocol_deviations REAL DEFAULT 0.0,
            clean_status TEXT,
            criteria_met INTEGER DEFAULT 0,
            criteria_total INTEGER DEFAULT 11,
            failing_criteria TEXT,
            calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_name, site_id, subject_id)
        )
    """)
    print("Created table: subject_dqi_clean_status")
    
    # Create indexes for better query performance
    print("\nCreating indexes...")
    
    # Indexes for subject_level_metrics
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_slm_project_site_subject ON subject_level_metrics(project_name, site_id, subject_id)")
    
    # Indexes for query_report
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_qr_project_site_subject ON query_report(project_name, site_id, subject_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_qr_query_status ON query_report(query_status)")
    
    # Indexes for non_conformant
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_nc_project_site_subject ON non_conformant(project_name, site_id, subject_id)")
    
    # Indexes for completed_visits
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cv_project_site_subject ON completed_visits(project_name, site_id, subject_id)")
    
    # Indexes for sae_issues
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sae_project_subject ON sae_issues(project_name, subject_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sae_responsible_lf ON sae_issues(responsible_lf)")
    
    # Indexes for global_coding_report
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_gcr_project_subject ON global_coding_report(project_name, subject_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_gcr_report_type ON global_coding_report(report_type)")
    
    # Indexes for missing_pages
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mp_project_site_subject ON missing_pages(project_name, site_id, subject_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mp_page_type ON missing_pages(page_type)")
    
    # Indexes for missing_visits
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mv_project_site_subject ON missing_visits(project_name, site_id, subject_id)")
    
    # Indexes for subject_dqi_clean_status
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dqi_project_site_subject ON subject_dqi_clean_status(project_name, site_id, subject_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dqi_category ON subject_dqi_clean_status(dqi_category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_clean_status ON subject_dqi_clean_status(clean_status)")
    
    print("Indexes created successfully")
    
    # Commit and close
    conn.commit()
    conn.close()
    
    print(f"\nDatabase created successfully at: {DB_PATH}")
    print("All tables and indexes created.")

def verify_database():
    """Verify database creation by listing all tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print("\n" + "="*60)
    print("DATABASE VERIFICATION")
    print("="*60)
    print(f"\nTotal tables created: {len(tables)}")
    print("\nTable names:")
    for i, table in enumerate(tables, 1):
        print(f"{i}. {table[0]}")
    
    conn.close()

if __name__ == "__main__":
    print("="*60)
    print("EDC METRICS DATABASE CREATION")
    print("="*60)
    print()
    
    # Create database and tables
    create_database()
    
    # Verify creation
    verify_database()
    
    print("\n" + "="*60)
    print("Database setup complete!")
    print("="*60)
