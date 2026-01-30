import sqlite3
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Database file path
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

# DQI Configuration - Weights based on regulatory impact analysis
DQI_WEIGHTS = {
    'safety_issues': 0.25,      # Unresolved SAEs (highest regulatory scrutiny)
    'open_queries': 0.15,        # Query resolution indicator
    'missing_visits': 0.15,      # Protocol deviations impact
    'missing_pages': 0.10,       # Data completeness
    'non_conformant': 0.15,      # Data quality indicator
    'unsigned_crfs': 0.10,       # GCP compliance
    'unverified_forms': 0.10,    # Source document verification
    'uncoded_terms': 0.05,       # Coding completeness
    'protocol_deviations': 0.05  # Protocol compliance
}

# Maximum thresholds (95th percentile from benchmarking)
# Updated based on actual data analysis - balanced thresholds for realistic DQI scoring
MAX_THRESHOLDS = {
    'open_queries': 1,
    'missing_visits': 0,
    'missing_pages': 0,
    'safety_issues': 2,
    'non_conformant_pct': 0.0,
    'unsigned_crfs': 12,
    'unverified_forms': 8,
    'uncoded_terms': 0,
    'protocol_deviations': 0
}

def get_db_connection():
    """Create and return a database connection"""
    return sqlite3.connect(DB_PATH)

def normalize_metric(actual_value, max_threshold):
    """
    Normalize metric to 0-100 scale
    Formula: 100 * (1 - (Actual Issues / Maximum Threshold))
    Capped at 0 minimum and 100 maximum
    """
    if max_threshold == 0:
        return 100.0
    
    ratio = actual_value / max_threshold
    normalized = 100.0 * (1.0 - ratio)
    
    # Cap between 0 and 100
    return max(0.0, min(100.0, normalized))

def calculate_dqi_category(dqi_score):
    """
    Categorize DQI score:
    - 90-100: Excellent (Green) - Submission ready
    - 75-89: Good (Light Green) - Minor cleanup required
    - 60-74: Acceptable (Yellow) - Moderate issues, action plan needed
    - 40-59: Needs Attention (Orange) - Significant gaps, delay risk
    - 0-39: Critical (Red) - Major intervention required
    """
    if dqi_score >= 90:
        return 'Excellent'
    elif dqi_score >= 75:
        return 'Good'
    elif dqi_score >= 60:
        return 'Acceptable'
    elif dqi_score >= 40:
        return 'Needs Attention'
    else:
        return 'Critical'

def calculate_dqi_for_all_subjects():
    """
    Calculate DQI scores for all subjects using SQL queries
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\nCalculating Data Quality Index (DQI) for all subjects...")
    
    # Query to get all necessary metrics from subject_level_metrics
    query = """
        SELECT 
            project_name,
            site_id,
            subject_id,
            total_queries,
            missing_visits,
            missing_page,
            esae_dashboard_dm + esae_dashboard_safety as safety_issues,
            pages_entered,
            pages_non_conformant,
            crfs_never_signed + crfs_overdue_within_45_days + 
                crfs_overdue_45_to_90_days + crfs_overdue_beyond_90_days as unsigned_crfs,
            crfs_require_verification as unverified_forms,
            uncoded_terms,
            pds_proposed as protocol_deviations
        FROM subject_level_metrics
    """
    
    cursor.execute(query)
    subjects = cursor.fetchall()
    
    dqi_results = []
    
    for subject in subjects:
        (project_name, site_id, subject_id, open_queries, missing_visits, 
         missing_pages, safety_issues, pages_entered, pages_non_conformant,
         unsigned_crfs, unverified_forms, uncoded_terms, protocol_deviations) = subject
        
        # Calculate non-conformant percentage
        if pages_entered and pages_entered > 0:
            non_conformant_pct = (pages_non_conformant / pages_entered) * 100
        else:
            non_conformant_pct = 0.0
        
        # Normalize each metric
        norm_open_queries = normalize_metric(open_queries or 0, MAX_THRESHOLDS['open_queries'])
        norm_missing_visits = normalize_metric(missing_visits or 0, MAX_THRESHOLDS['missing_visits'])
        norm_missing_pages = normalize_metric(missing_pages or 0, MAX_THRESHOLDS['missing_pages'])
        norm_safety = normalize_metric(safety_issues or 0, MAX_THRESHOLDS['safety_issues'])
        norm_non_conformant = normalize_metric(non_conformant_pct, MAX_THRESHOLDS['non_conformant_pct'])
        norm_unsigned = normalize_metric(unsigned_crfs or 0, MAX_THRESHOLDS['unsigned_crfs'])
        norm_unverified = normalize_metric(unverified_forms or 0, MAX_THRESHOLDS['unverified_forms'])
        norm_uncoded = normalize_metric(uncoded_terms or 0, MAX_THRESHOLDS['uncoded_terms'])
        norm_pd = normalize_metric(protocol_deviations or 0, MAX_THRESHOLDS['protocol_deviations'])
        
        # Calculate weighted DQI score
        dqi_score = (
            DQI_WEIGHTS['safety_issues'] * norm_safety +
            DQI_WEIGHTS['open_queries'] * norm_open_queries +
            DQI_WEIGHTS['missing_visits'] * norm_missing_visits +
            DQI_WEIGHTS['missing_pages'] * norm_missing_pages +
            DQI_WEIGHTS['non_conformant'] * norm_non_conformant +
            DQI_WEIGHTS['unsigned_crfs'] * norm_unsigned +
            DQI_WEIGHTS['unverified_forms'] * norm_unverified +
            DQI_WEIGHTS['uncoded_terms'] * norm_uncoded +
            DQI_WEIGHTS['protocol_deviations'] * norm_pd
        )
        
        # FINAL SAFETY CHECK: Cap DQI score at 100
        # This handles any edge cases where floating-point arithmetic might push it slightly over
        dqi_score = min(100.0, max(0.0, dqi_score))
        
        # Determine DQI category
        dqi_category = calculate_dqi_category(dqi_score)
        
        dqi_results.append((
            project_name, site_id, subject_id,
            round(dqi_score, 2), dqi_category,
            round(norm_safety, 2), round(norm_open_queries, 2),
            round(norm_missing_visits, 2), round(norm_missing_pages, 2),
            round(norm_non_conformant, 2), round(norm_unsigned, 2),
            round(norm_unverified, 2), round(norm_uncoded, 2),
            round(norm_pd, 2)
        ))
    
    # Insert DQI results (will update clean status later)
    insert_sql = """
        INSERT OR REPLACE INTO subject_dqi_clean_status (
            project_name, site_id, subject_id,
            dqi_score, dqi_category,
            norm_safety_issues, norm_open_queries,
            norm_missing_visits, norm_missing_pages,
            norm_non_conformant, norm_unsigned_crfs,
            norm_unverified_forms, norm_uncoded_terms,
            norm_protocol_deviations,
            calculated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """
    
    cursor.executemany(insert_sql, dqi_results)
    conn.commit()
    
    print(f"✓ Calculated DQI for {len(dqi_results)} subjects")
    
    # Print DQI category distribution
    category_query = """
        SELECT dqi_category, COUNT(*) as count
        FROM subject_dqi_clean_status
        GROUP BY dqi_category
        ORDER BY 
            CASE dqi_category
                WHEN 'Excellent' THEN 1
                WHEN 'Good' THEN 2
                WHEN 'Acceptable' THEN 3
                WHEN 'Needs Attention' THEN 4
                WHEN 'Critical' THEN 5
            END
    """
    cursor.execute(category_query)
    categories = cursor.fetchall()
    
    print("\nDQI Category Distribution:")
    for category, count in categories:
        print(f"  {category}: {count} subjects")
    
    conn.close()

def calculate_clean_status_for_all_subjects():
    """
    Calculate Clean Patient Status for all subjects using 11-criteria assessment
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\nCalculating Clean Patient Status for all subjects...")
    
    # Query to get all necessary metrics from subject_level_metrics
    query = """
        SELECT 
            project_name,
            site_id,
            subject_id,
            missing_visits,
            missing_page,
            total_queries,
            pages_non_conformant,
            uncoded_terms,
            crfs_require_verification,
            crfs_never_signed,
            broken_signatures,
            open_issues_in_lnr,
            open_issues_edrr,
            esae_dashboard_dm,
            esae_dashboard_safety
        FROM subject_level_metrics
    """
    
    cursor.execute(query)
    subjects = cursor.fetchall()
    
    clean_status_results = []
    
    for subject in subjects:
        (project_name, site_id, subject_id, missing_visits, missing_page,
         total_queries, pages_non_conformant, uncoded_terms, crfs_require_verification,
         crfs_never_signed, broken_signatures, open_issues_in_lnr, open_issues_edrr,
         esae_dashboard_dm, esae_dashboard_safety) = subject
        
        # 11 Clean Criteria Assessment (Boolean Logic)
        criteria = {
            'no_missing_visits': (missing_visits or 0) == 0,
            'no_missing_pages': (missing_page or 0) == 0,
            'no_open_queries': (total_queries or 0) == 0,
            'no_non_conformant_data': (pages_non_conformant or 0) == 0,
            'no_uncoded_terms': (uncoded_terms or 0) == 0,
            'all_forms_verified': (crfs_require_verification or 0) == 0,
            'all_forms_signed': (crfs_never_signed or 0) == 0,
            'no_broken_signatures': (broken_signatures or 0) == 0,
            'no_lab_issues': (open_issues_in_lnr or 0) == 0,
            'no_edrr_issues': (open_issues_edrr or 0) == 0,
            'no_safety_issues': ((esae_dashboard_dm or 0) + (esae_dashboard_safety or 0)) == 0
        }
        
        # Calculate criteria met
        criteria_met = sum(criteria.values())
        criteria_total = len(criteria)
        
        # Determine clean status (ALL criteria must be met)
        is_clean = all(criteria.values())
        clean_status = 'Clean' if is_clean else 'Not Clean'
        
        # Create failing criteria list
        failing_criteria = [k for k, v in criteria.items() if not v]
        failing_criteria_str = ', '.join(failing_criteria) if failing_criteria else None
        
        clean_status_results.append((
            clean_status, criteria_met, criteria_total, failing_criteria_str,
            project_name, site_id, subject_id
        ))
    
    # Update clean status in existing records
    update_sql = """
        UPDATE subject_dqi_clean_status
        SET clean_status = ?,
            criteria_met = ?,
            criteria_total = ?,
            failing_criteria = ?,
            calculated_at = CURRENT_TIMESTAMP
        WHERE project_name = ? AND site_id = ? AND subject_id = ?
    """
    
    cursor.executemany(update_sql, clean_status_results)
    conn.commit()
    
    print(f"✓ Calculated Clean Status for {len(clean_status_results)} subjects")
    
    # Print clean status distribution
    status_query = """
        SELECT clean_status, COUNT(*) as count
        FROM subject_dqi_clean_status
        GROUP BY clean_status
    """
    cursor.execute(status_query)
    statuses = cursor.fetchall()
    
    print("\nClean Status Distribution:")
    for status, count in statuses:
        print(f"  {status}: {count} subjects")
    
    # Print average criteria met
    avg_query = """
        SELECT AVG(criteria_met) as avg_criteria_met
        FROM subject_dqi_clean_status
    """
    cursor.execute(avg_query)
    avg_criteria = cursor.fetchone()[0]
    print(f"\nAverage Criteria Met: {avg_criteria:.2f} out of 11")
    
    conn.close()

def calculate_all_dqi_and_clean_status():
    """
    Main function to calculate both DQI and Clean Status for all subjects
    """
    print("="*70)
    print("DQI AND CLEAN STATUS CALCULATION")
    print("="*70)
    
    # Step 1: Calculate DQI
    calculate_dqi_for_all_subjects()
    
    # Step 2: Calculate Clean Status
    calculate_clean_status_for_all_subjects()
    
    print("\n" + "="*70)
    print("✓ DQI AND CLEAN STATUS CALCULATION COMPLETED")
    print("="*70)

def verify_dqi_clean_status():
    """
    Verify DQI and Clean Status calculations by showing sample results
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n" + "="*70)
    print("DQI AND CLEAN STATUS VERIFICATION")
    print("="*70)
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM subject_dqi_clean_status")
    total_count = cursor.fetchone()[0]
    print(f"\nTotal subjects with DQI/Clean Status: {total_count}")
    
    # Show sample of excellent DQI subjects
    print("\nSample Subjects with Excellent DQI (Top 5):")
    cursor.execute("""
        SELECT project_name, site_id, subject_id, dqi_score, clean_status
        FROM subject_dqi_clean_status
        WHERE dqi_category = 'Excellent'
        ORDER BY dqi_score DESC
        LIMIT 5
    """)
    excellent_subjects = cursor.fetchall()
    for proj, site, subj, score, status in excellent_subjects:
        print(f"  {proj} | {site} | {subj} | DQI: {score} | Status: {status}")
    
    # Show sample of subjects needing attention
    print("\nSample Subjects Needing Attention (Top 5):")
    cursor.execute("""
        SELECT project_name, site_id, subject_id, dqi_score, clean_status, failing_criteria
        FROM subject_dqi_clean_status
        WHERE dqi_category IN ('Needs Attention', 'Critical')
        ORDER BY dqi_score ASC
        LIMIT 5
    """)
    attention_subjects = cursor.fetchall()
    for proj, site, subj, score, status, failing in attention_subjects:
        print(f"  {proj} | {site} | {subj} | DQI: {score} | Status: {status}")
        if failing:
            print(f"    Failing: {failing[:80]}...")
    
    conn.close()
    print("="*70)

if __name__ == "__main__":
    # Calculate DQI and Clean Status
    calculate_all_dqi_and_clean_status()
    
    # Verify results
    verify_dqi_clean_status()
