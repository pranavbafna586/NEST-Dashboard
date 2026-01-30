import sqlite3
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
# Database file path
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

def get_db_connection():
    """Create and return a database connection"""
    conn = sqlite3.connect(DB_PATH)
    # Optimize SQLite for bulk inserts
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA cache_size = 10000")
    conn.execute("PRAGMA temp_store = MEMORY")
    return conn

def convert_date_for_db(date_val):
    """Convert date value to string format for database"""
    if pd.isna(date_val) or date_val is None:
        return None
    if isinstance(date_val, str):
        return date_val
    return str(date_val)

def convert_int_for_db(int_val):
    """Convert integer value for database, handling NA/None and invalid literals"""
    if pd.isna(int_val) or int_val is None:
        return 0
    try:
        return int(int_val)
    except ValueError:
        print(f"Warning: Unable to convert value '{int_val}' to integer. Defaulting to 0.")
        return 0

def convert_float_for_db(float_val):
    """Convert float value for database, handling NA/None"""
    if pd.isna(float_val) or float_val is None:
        return 0.0
    return float(float_val)

def prepare_subject_level_metrics_data(df):
    """Prepare data for batch insert"""
    data = []
    for _, row in df.iterrows():
        data.append((
            row['Project Name'], row.get('Region'), row.get('Country'), 
            row['Site ID'], row['Subject ID'], row.get('Latest Visit (SV)'), 
            row.get('Subject Status'),
            convert_int_for_db(row.get('Missing Visits')),
            convert_int_for_db(row.get('Missing Page')),
            convert_int_for_db(row.get('Coded terms')),
            convert_int_for_db(row.get('Uncoded Terms')),
            convert_int_for_db(row.get('Open issues in LNR')),
            convert_int_for_db(row.get('Open Issues reported for 3rd party reconciliation in EDRR')),
            convert_int_for_db(row.get('Inactivated forms and folders')),
            convert_int_for_db(row.get('eSAE dashboard review for DM')),
            convert_int_for_db(row.get('eSAE dashboard review for safety')),
            convert_int_for_db(row.get('Expected Visits')),
            convert_int_for_db(row.get('Pages Entered')),
            convert_int_for_db(row.get('Pages with Non-Conformant data')),
            convert_int_for_db(row.get('Total CRFs with queries & Non-Conformant data')),
            convert_int_for_db(row.get('Total CRFs without queries & Non-Conformant data')),
            convert_float_for_db(row.get('Percentage Clean Entered CRF')),
            convert_int_for_db(row.get('DM Queries')),
            convert_int_for_db(row.get('Clinical Queries')),
            convert_int_for_db(row.get('Medical Queries')),
            convert_int_for_db(row.get('Site Queries')),
            convert_int_for_db(row.get('Field Monitor Queries')),
            convert_int_for_db(row.get('Coding Queries')),
            convert_int_for_db(row.get('Safety Queries')),
            convert_int_for_db(row.get('Total Queries')),
            convert_int_for_db(row.get('CRFs Require Verification (SDV)')),
            convert_int_for_db(row.get('Forms Verified')),
            convert_int_for_db(row.get('CRFs Frozen')),
            convert_int_for_db(row.get('CRFs Not Frozen')),
            convert_int_for_db(row.get('CRFs Locked')),
            convert_int_for_db(row.get('CRFs Unlocked')),
            convert_int_for_db(row.get('PDs Confirmed')),
            convert_int_for_db(row.get('PDs Proposed')),
            convert_int_for_db(row.get('CRFs Signed')),
            convert_int_for_db(row.get('CRFs overdue for signs within 45 days of Data entry')),
            convert_int_for_db(row.get('CRFs overdue for signs between 45 to 90 days of Data entry')),
            convert_int_for_db(row.get('CRFs overdue for signs beyond 90 days of Data entry')),
            convert_int_for_db(row.get('Broken Signatures')),
            convert_int_for_db(row.get('CRFs Never Signed'))
        ))
    return data

def insert_subject_level_metrics(conn, df):
    """Insert data into subject_level_metrics table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT OR REPLACE INTO subject_level_metrics (
            project_name, region, country, site_id, subject_id,
            latest_visit, subject_status, missing_visits, missing_page,
            coded_terms, uncoded_terms, open_issues_in_lnr, open_issues_edrr,
            inactivated_forms_folders, esae_dashboard_dm, esae_dashboard_safety,
            expected_visits, pages_entered, pages_non_conformant,
            crfs_with_queries_nc, crfs_without_queries_nc, percentage_clean_crf,
            dm_queries, clinical_queries, medical_queries, site_queries,
            field_monitor_queries, coding_queries, safety_queries, total_queries,
            crfs_require_verification, forms_verified, crfs_frozen, crfs_not_frozen,
            crfs_locked, crfs_unlocked, pds_confirmed, pds_proposed, crfs_signed,
            crfs_overdue_within_45_days, crfs_overdue_45_to_90_days,
            crfs_overdue_beyond_90_days, broken_signatures, crfs_never_signed,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """
    
    data = prepare_subject_level_metrics_data(df)
    cursor.executemany(sql, data)
    # Removed conn.commit() - handled by insert_all_data()

def insert_query_report(conn, df):
    """Insert data into query_report table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO query_report (
            project_name, region, country, site_id, subject_id,
            visit_name, form_name, field_oid, logline, visit_date,
            query_status, action_owner, marking_group_name,
            query_open_date, query_response_date, days_since_open, days_since_response
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), row.get('Field OID'), row.get('Logline'),
            convert_date_for_db(row.get('Visit Date')),
            row.get('Query Status'), row.get('Action Owner'),
            row.get('Marking Group Name'),
            convert_date_for_db(row.get('Query Open Date')),
            convert_date_for_db(row.get('Query Response Date')),
            convert_int_for_db(row.get('Days Since Open')),
            convert_int_for_db(row.get('Days Since Response'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_non_conformant(conn, df):
    """Insert data into non_conformant table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO non_conformant (
            project_name, region, country, site_id, subject_id,
            visit_name, form_name, logline, field_oid, audit_time, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), row.get('Logline'), row.get('Field OID'),
            row.get('Audit Time'), convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_pi_signature_report(conn, df):
    """Insert data into pi_signature_report table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO pi_signature_report (
            project_name, region, country, site_id, subject_id,
            visit_name, form_name, page_require_signature, audit_action,
            visit_date, date_page_entered, no_of_days, pending_since
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), row.get('Page Require Signature'),
            row.get('Audit Action'),
            convert_date_for_db(row.get('Visit Date')),
            convert_date_for_db(row.get('Date page entered/ Date last PI Sign')),
            convert_int_for_db(row.get('No. of days')),
            row.get('Pending since/ PI signed since')
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_sdv(conn, df):
    """Insert data into sdv table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO sdv (
            project_name, region, country, site_id, subject_id,
            visit_name, form_name, visit_date, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), convert_date_for_db(row.get('Visit Date')),
            row.get('Verification Status')
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_protocol_deviation(conn, df):
    """Insert data into protocol_deviation table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO protocol_deviation (
            project_name, region, country, site_id, subject_id,
            visit_name, form_name, logline, pd_status, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), row.get('Logline'), row.get('PD Status'),
            convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_crf_freeze_unfreeze(conn, df_freeze, df_unfreeze):
    """Insert data into crf_freeze_unfreeze table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO crf_freeze_unfreeze (
            project_name, region, country, site_id, subject_id,
            form_name, freeze_status, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    # Prepare freeze data
    freeze_data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Form Name'),
            'Frozen', convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df_freeze.iterrows()
    ]
    
    # Prepare unfreeze data
    unfreeze_data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Form Name'),
            'UnFrozen', convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df_unfreeze.iterrows()
    ]
    
    # Batch insert both
    cursor.executemany(sql, freeze_data + unfreeze_data)
    # Removed conn.commit()

def insert_crf_lock_unlock(conn, df_locked, df_unlocked):
    """Insert data into crf_lock_unlock table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO crf_lock_unlock (
            project_name, region, country, site_id, subject_id,
            form_name, lock_status, audit_user, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    # Prepare locked data
    locked_data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Form Name'),
            'Locked', row.get('Audit User'),
            convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df_locked.iterrows()
    ]
    
    # Prepare unlocked data
    unlocked_data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Form Name'),
            'UnLocked', row.get('Audit User'),
            convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df_unlocked.iterrows()
    ]
    
    # Batch insert both
    cursor.executemany(sql, locked_data + unlocked_data)
    # Removed conn.commit()

def insert_completed_visits(conn, df):
    """Insert data into completed_visits table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO completed_visits (
            project_name, region, country, site_id, subject_id,
            visit_name, visit_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Region'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            convert_date_for_db(row.get('Visit Date'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_edrr_issues(conn, df):
    """Insert data into edrr_issues table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT OR REPLACE INTO edrr_issues (
            project_name, subject_id, total_open_issue_count
        ) VALUES (?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row['Subject ID'],
            convert_int_for_db(row.get('Total Open Issue Count'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_sae_issues(conn, df_dm, df_safety):
    """Insert data into sae_issues table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO sae_issues (
            discrepancy_id, project_name, country, site_id, subject_id,
            form_name, case_status, discrepancy_created_timestamp,
            review_status, action_status, responsible_lf
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    # Prepare DM data
    dm_data = [
        (
            row.get('Discrepancy ID'), row['Project Name'], row.get('Country'),
            row.get('Site ID'), row['Subject ID'], row.get('Form Name'),
            None, str(row.get('Discrepancy Created Timestamp')) if pd.notna(row.get('Discrepancy Created Timestamp')) else None,
            row.get('Review Status'), row.get('Action Status'), 'DM'
        )
        for _, row in df_dm.iterrows()
    ]
    
    # Prepare Safety data
    safety_data = [
        (
            row.get('Discrepancy ID'), row['Project Name'], row.get('Country'),
            row.get('Site ID'), row['Subject ID'], None,
            row.get('Case Status'), str(row.get('Discrepancy Created Timestamp')) if pd.notna(row.get('Discrepancy Created Timestamp')) else None,
            row.get('Review Status'), row.get('Action Status'), 'Safety'
        )
        for _, row in df_safety.iterrows()
    ]
    
    # Batch insert both
    cursor.executemany(sql, dm_data + safety_data)
    # Removed conn.commit()

def insert_global_coding_report(conn, df_meddra, df_whodd):
    """Insert data into global_coding_report table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO global_coding_report (
            project_name, report_type, dictionary, dictionary_version,
            subject_id, form_oid, logline, field_oid, coding_status, require_coding
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    # Prepare MedDRA data
    meddra_data = [
        (
            row['Project Name'], 'MedDRA', row.get('Dictionary'),
            row.get('Dictionary Version number'), row['Subject ID'],
            row.get('Form OID'), row.get('Logline'), row.get('Field OID'),
            row.get('Coding Status'), row.get('Require Coding')
        )
        for _, row in df_meddra.iterrows()
    ]
    
    # Prepare WHODD data
    whodd_data = [
        (
            row['Project Name'], 'WHODD', row.get('Dictionary'),
            row.get('Dictionary Version number'), row['Subject ID'],
            row.get('Form OID'), row.get('Logline'), row.get('Field OID'),
            row.get('Coding Status'), row.get('Require Coding')
        )
        for _, row in df_whodd.iterrows()
    ]
    
    # Batch insert both
    cursor.executemany(sql, meddra_data + whodd_data)
    # Removed conn.commit()

def insert_inactivated_forms_folders(conn, df):
    """Insert data into inactivated_forms_folders table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO inactivated_forms_folders (
            project_name, country, site_id, subject_id, visit_name,
            form_name, data_on_form, record_position, audit_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Country'), row['Site ID'],
            row['Subject ID'], row.get('Visit Name'), row.get('Form Name'),
            row.get('Data on Form/Record'), row.get('Record Position'),
            row.get('Audit Action')
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_missing_lab_name_ranges(conn, df):
    """Insert data into missing_lab_name_ranges table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO missing_lab_name_ranges (
            project_name, country, site_id, subject_id, visit_name,
            form_name, lab_category, lab_date, test_name, test_description, issue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Country'), row['Site ID'],
            row['Subject ID'], row.get('Visit Name'), row.get('Form Name'),
            row.get('Lab category'), convert_date_for_db(row.get('Lab Date')),
            row.get('Test Name'), row.get('Test description'), row.get('Issue')
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_missing_pages(conn, df):
    """Insert data into missing_pages table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO missing_pages (
            project_name, page_type, country, site_id, subject_id,
            visit_name, form_name, visit_date, subject_status, days_missing
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Form Type'), row.get('Country'),
            row['Site ID'], row['Subject ID'], row.get('Visit Name'),
            row.get('Form Name'), convert_date_for_db(row.get('Visit Date')),
            row.get('Subject Status'), convert_int_for_db(row.get('Days Missing'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_missing_visits(conn, df):
    """Insert data into missing_visits table - optimized batch insert"""
    cursor = conn.cursor()
    
    sql = """
        INSERT INTO missing_visits (
            project_name, country, site_id, subject_id, visit_name,
            projected_date, days_outstanding
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    
    data = [
        (
            row['Project Name'], row.get('Country'), row['Site ID'],
            row['Subject ID'], row.get('Visit Name'),
            convert_date_for_db(row.get('Projected Date')),
            convert_int_for_db(row.get('Days Outstanding'))
        )
        for _, row in df.iterrows()
    ]
    
    cursor.executemany(sql, data)
    # Removed conn.commit()

def insert_all_data(dataframes, filled_subject_metrics):
    """Main function to insert all data into database - optimized with single transaction"""
    
    conn = get_db_connection()
    
    try:
        conn.execute("BEGIN TRANSACTION")
        
        insert_subject_level_metrics(conn, filled_subject_metrics)
        insert_query_report(conn, dataframes['Query Report - Cumulative'])
        insert_non_conformant(conn, dataframes['Non conformant'])
        insert_pi_signature_report(conn, dataframes['PI Signature Report'])
        insert_sdv(conn, dataframes['SDV'])
        insert_protocol_deviation(conn, dataframes['Protocol Deviation'])
        insert_crf_freeze_unfreeze(conn, dataframes['CRF Freeze'], dataframes['CRF UnFreeze'])
        insert_crf_lock_unlock(conn, dataframes['CRF Locked'], dataframes['CRF UnLocked'])
        insert_completed_visits(conn, dataframes['SV'])
        insert_edrr_issues(conn, dataframes['Compiled_EDRR'])
        insert_sae_issues(conn, dataframes['SAE Dashboard_DM'], dataframes['SAE Dashboard_Safety'])
        insert_global_coding_report(conn, dataframes['GlobalCoding_MedDRA'], dataframes['GlobalCoding_WHODD'])
        insert_inactivated_forms_folders(conn, dataframes['Inactivated_Forms'])
        insert_missing_lab_name_ranges(conn, dataframes['Missing_Lab'])
        insert_missing_pages(conn, dataframes['All Pages Missing'])
        insert_missing_visits(conn, dataframes['Visit_Projection_Tracker'])
        
        conn.execute("COMMIT")
        
    except Exception as e:
        conn.rollback()
        raise
    
    finally:
        conn.close()

def verify_insertion():
    """Verify data insertion by counting records in all tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("DATABASE VERIFICATION - RECORD COUNTS")
    print("="*60)
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"{table_name}: {count} records")
    
    conn.close()
    print("="*60)
