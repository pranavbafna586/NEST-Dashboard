import sqlite3
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

# Database file path
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

def get_db_connection():
    """Create and return a database connection"""
    return sqlite3.connect(DB_PATH)

def analyze_raw_metrics():
    """Analyze raw metrics from subject_level_metrics to validate thresholds"""
    conn = get_db_connection()
    
    print("="*80)
    print("RAW METRICS ANALYSIS - Identifying Threshold Issues")
    print("="*80)
    
    # Query to get raw metrics statistics
    query = """
        SELECT 
            COUNT(*) as total_subjects,
            MAX(total_queries) as max_queries,
            MAX(missing_visits) as max_missing_visits,
            MAX(missing_page) as max_missing_pages,
            MAX(esae_dashboard_dm + esae_dashboard_safety) as max_safety_issues,
            MAX(CASE WHEN pages_entered > 0 
                THEN CAST(pages_non_conformant AS FLOAT) * 100 / pages_entered 
                ELSE 0 END) as max_non_conformant_pct,
            MAX(crfs_never_signed + crfs_overdue_within_45_days + 
                crfs_overdue_45_to_90_days + crfs_overdue_beyond_90_days) as max_unsigned_crfs,
            MAX(crfs_require_verification) as max_unverified_forms,
            MAX(uncoded_terms) as max_uncoded_terms,
            MAX(pds_proposed) as max_protocol_deviations,
            AVG(total_queries) as avg_queries,
            AVG(missing_visits) as avg_missing_visits,
            AVG(missing_page) as avg_missing_pages,
            AVG(esae_dashboard_dm + esae_dashboard_safety) as avg_safety_issues,
            AVG(CASE WHEN pages_entered > 0 
                THEN CAST(pages_non_conformant AS FLOAT) * 100 / pages_entered 
                ELSE 0 END) as avg_non_conformant_pct,
            AVG(crfs_never_signed + crfs_overdue_within_45_days + 
                crfs_overdue_45_to_90_days + crfs_overdue_beyond_90_days) as avg_unsigned_crfs,
            AVG(crfs_require_verification) as avg_unverified_forms,
            AVG(uncoded_terms) as avg_uncoded_terms,
            AVG(pds_proposed) as avg_protocol_deviations
        FROM subject_level_metrics
    """
    
    df = pd.read_sql_query(query, conn)
    
    print(f"\nTotal Subjects Analyzed: {df['total_subjects'].iloc[0]}\n")
    
    # Current thresholds
    thresholds = {
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
    
    print("METRIC COMPARISON WITH THRESHOLDS")
    print("-" * 80)
    print(f"{'Metric':<30} {'Max Value':<15} {'Avg Value':<15} {'Threshold':<15} {'Status'}")
    print("-" * 80)
    
    metrics_data = [
        ('Open Queries', df['max_queries'].iloc[0], df['avg_queries'].iloc[0], thresholds['open_queries']),
        ('Missing Visits', df['max_missing_visits'].iloc[0], df['avg_missing_visits'].iloc[0], thresholds['missing_visits']),
        ('Missing Pages', df['max_missing_pages'].iloc[0], df['avg_missing_pages'].iloc[0], thresholds['missing_pages']),
        ('Safety Issues', df['max_safety_issues'].iloc[0], df['avg_safety_issues'].iloc[0], thresholds['safety_issues']),
        ('Non-Conformant %', df['max_non_conformant_pct'].iloc[0], df['avg_non_conformant_pct'].iloc[0], thresholds['non_conformant_pct']),
        ('Unsigned CRFs', df['max_unsigned_crfs'].iloc[0], df['avg_unsigned_crfs'].iloc[0], thresholds['unsigned_crfs']),
        ('Unverified Forms', df['max_unverified_forms'].iloc[0], df['avg_unverified_forms'].iloc[0], thresholds['unverified_forms']),
        ('Uncoded Terms', df['max_uncoded_terms'].iloc[0], df['avg_uncoded_terms'].iloc[0], thresholds['uncoded_terms']),
        ('Protocol Deviations', df['max_protocol_deviations'].iloc[0], df['avg_protocol_deviations'].iloc[0], thresholds['protocol_deviations'])
    ]
    
    problematic_metrics = []
    
    for metric_name, max_val, avg_val, threshold in metrics_data:
        status = "✓ OK" if max_val <= threshold else "✗ EXCEEDS"
        if max_val > threshold:
            problematic_metrics.append(metric_name)
        print(f"{metric_name:<30} {max_val:<15.2f} {avg_val:<15.2f} {threshold:<15} {status}")
    
    if problematic_metrics:
        print("\n" + "="*80)
        print("⚠ WARNING: The following metrics EXCEED current thresholds:")
        for metric in problematic_metrics:
            print(f"  - {metric}")
        print("\nThese need threshold adjustments to prevent normalization issues!")
        print("="*80)
    
    conn.close()

def analyze_dqi_scores():
    """Analyze DQI scores to identify subjects with scores > 100"""
    conn = get_db_connection()
    
    print("\n" + "="*80)
    print("DQI SCORE ANALYSIS - Identifying Anomalies")
    print("="*80)
    
    # Check for scores > 100
    query_high_scores = """
        SELECT 
            project_name, site_id, subject_id, dqi_score,
            norm_safety_issues, norm_open_queries, norm_missing_visits,
            norm_missing_pages, norm_non_conformant, norm_unsigned_crfs,
            norm_unverified_forms, norm_uncoded_terms, norm_protocol_deviations
        FROM subject_dqi_clean_status
        WHERE dqi_score > 100
        ORDER BY dqi_score DESC
        LIMIT 10
    """
    
    df_high = pd.read_sql_query(query_high_scores, conn)
    
    if len(df_high) > 0:
        print(f"\n⚠ Found {len(df_high)} subjects with DQI > 100!")
        print("\nTop 10 subjects with highest DQI scores:")
        print("-" * 80)
        for _, row in df_high.iterrows():
            print(f"\nProject: {row['project_name']} | Site: {row['site_id']} | Subject: {row['subject_id']}")
            print(f"DQI Score: {row['dqi_score']:.2f}")
            print(f"Normalized Scores:")
            print(f"  Safety: {row['norm_safety_issues']:.2f}")
            print(f"  Queries: {row['norm_open_queries']:.2f}")
            print(f"  Missing Visits: {row['norm_missing_visits']:.2f}")
            print(f"  Missing Pages: {row['norm_missing_pages']:.2f}")
            print(f"  Non-Conformant: {row['norm_non_conformant']:.2f}")
            print(f"  Unsigned CRFs: {row['norm_unsigned_crfs']:.2f}")
            print(f"  Unverified: {row['norm_unverified_forms']:.2f}")
            print(f"  Uncoded: {row['norm_uncoded_terms']:.2f}")
            print(f"  PDs: {row['norm_protocol_deviations']:.2f}")
    else:
        print("\n✓ No subjects with DQI > 100 found.")
    
    # Overall DQI statistics
    query_stats = """
        SELECT 
            COUNT(*) as total_subjects,
            MIN(dqi_score) as min_dqi,
            MAX(dqi_score) as max_dqi,
            AVG(dqi_score) as avg_dqi,
            COUNT(CASE WHEN dqi_score > 100 THEN 1 END) as count_over_100,
            COUNT(CASE WHEN dqi_score < 0 THEN 1 END) as count_under_0
        FROM subject_dqi_clean_status
    """
    
    df_stats = pd.read_sql_query(query_stats, conn)
    
    print("\n" + "="*80)
    print("DQI SCORE STATISTICS")
    print("-" * 80)
    print(f"Total Subjects: {df_stats['total_subjects'].iloc[0]}")
    print(f"Min DQI Score: {df_stats['min_dqi'].iloc[0]:.2f}")
    print(f"Max DQI Score: {df_stats['max_dqi'].iloc[0]:.2f}")
    print(f"Avg DQI Score: {df_stats['avg_dqi'].iloc[0]:.2f}")
    print(f"Subjects with DQI > 100: {df_stats['count_over_100'].iloc[0]}")
    print(f"Subjects with DQI < 0: {df_stats['count_under_0'].iloc[0]}")
    print("="*80)
    
    conn.close()

def get_raw_values_for_high_dqi():
    """Get raw metric values for subjects with DQI > 100"""
    conn = get_db_connection()
    
    print("\n" + "="*80)
    print("RAW VALUES FOR SUBJECTS WITH DQI > 100")
    print("="*80)
    
    query = """
        SELECT 
            slm.project_name, slm.site_id, slm.subject_id,
            dcs.dqi_score,
            slm.total_queries,
            slm.missing_visits,
            slm.missing_page,
            (slm.esae_dashboard_dm + slm.esae_dashboard_safety) as safety_issues,
            slm.pages_entered,
            slm.pages_non_conformant,
            CASE WHEN slm.pages_entered > 0 
                THEN CAST(slm.pages_non_conformant AS FLOAT) * 100 / slm.pages_entered 
                ELSE 0 END as non_conformant_pct,
            (slm.crfs_never_signed + slm.crfs_overdue_within_45_days + 
             slm.crfs_overdue_45_to_90_days + slm.crfs_overdue_beyond_90_days) as unsigned_crfs,
            slm.crfs_require_verification as unverified_forms,
            slm.uncoded_terms,
            slm.pds_proposed as protocol_deviations
        FROM subject_level_metrics slm
        JOIN subject_dqi_clean_status dcs 
            ON slm.project_name = dcs.project_name 
            AND slm.site_id = dcs.site_id 
            AND slm.subject_id = dcs.subject_id
        WHERE dcs.dqi_score > 100
        ORDER BY dcs.dqi_score DESC
        LIMIT 5
    """
    
    df = pd.read_sql_query(query, conn)
    
    if len(df) > 0:
        print(f"\nShowing top 5 subjects with DQI > 100 and their raw values:\n")
        for _, row in df.iterrows():
            print(f"\nSubject: {row['project_name']} | {row['site_id']} | {row['subject_id']}")
            print(f"DQI Score: {row['dqi_score']:.2f}")
            print(f"Raw Values:")
            print(f"  Total Queries: {row['total_queries']}")
            print(f"  Missing Visits: {row['missing_visits']}")
            print(f"  Missing Pages: {row['missing_page']}")
            print(f"  Safety Issues: {row['safety_issues']}")
            print(f"  Non-Conformant %: {row['non_conformant_pct']:.2f}%")
            print(f"  Unsigned CRFs: {row['unsigned_crfs']}")
            print(f"  Unverified Forms: {row['unverified_forms']}")
            print(f"  Uncoded Terms: {row['uncoded_terms']}")
            print(f"  Protocol Deviations: {row['protocol_deviations']}")
    else:
        print("\n✓ No subjects with DQI > 100 found.")
    
    conn.close()

def recommend_new_thresholds():
    """Recommend new thresholds based on 95th percentile of actual data"""
    conn = get_db_connection()
    
    print("\n" + "="*80)
    print("RECOMMENDED THRESHOLD ADJUSTMENTS (95th Percentile)")
    print("="*80)
    
    # Calculate 95th percentile for each metric
    query = """
        SELECT 
            project_name, site_id, subject_id,
            total_queries,
            missing_visits,
            missing_page,
            (esae_dashboard_dm + esae_dashboard_safety) as safety_issues,
            CASE WHEN pages_entered > 0 
                THEN CAST(pages_non_conformant AS FLOAT) * 100 / pages_entered 
                ELSE 0 END as non_conformant_pct,
            (crfs_never_signed + crfs_overdue_within_45_days + 
             crfs_overdue_45_to_90_days + crfs_overdue_beyond_90_days) as unsigned_crfs,
            crfs_require_verification as unverified_forms,
            uncoded_terms,
            pds_proposed as protocol_deviations
        FROM subject_level_metrics
    """
    
    df = pd.read_sql_query(query, conn)
    
    # Current thresholds
    current = {
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
    
    # Calculate 95th percentile
    recommended = {
        'open_queries': df['total_queries'].quantile(0.95),
        'missing_visits': df['missing_visits'].quantile(0.95),
        'missing_pages': df['missing_page'].quantile(0.95),
        'safety_issues': df['safety_issues'].quantile(0.95),
        'non_conformant_pct': df['non_conformant_pct'].quantile(0.95),
        'unsigned_crfs': df['unsigned_crfs'].quantile(0.95),
        'unverified_forms': df['unverified_forms'].quantile(0.95),
        'uncoded_terms': df['uncoded_terms'].quantile(0.95),
        'protocol_deviations': df['protocol_deviations'].quantile(0.95)
    }
    
    print(f"\n{'Metric':<30} {'Current':<15} {'Recommended (95%)':<20} {'Action'}")
    print("-" * 80)
    
    for key in current.keys():
        curr_val = current[key]
        rec_val = recommended[key]
        action = "✓ Keep" if rec_val <= curr_val else "↑ INCREASE"
        print(f"{key:<30} {curr_val:<15} {rec_val:<20.2f} {action}")
    
    print("\n" + "="*80)
    print("SUGGESTED CODE UPDATE FOR dqi_clean_status_cal.py:")
    print("="*80)
    print("\nMAX_THRESHOLDS = {")
    for key, value in recommended.items():
        # Round up to next integer for whole numbers, keep decimal for percentages
        if key == 'non_conformant_pct':
            suggested = round(value, 1)
        else:
            suggested = int(value) + 1  # Add buffer
        print(f"    '{key}': {suggested},")
    print("}")
    
    conn.close()

if __name__ == "__main__":
    # Run all analyses
    analyze_raw_metrics()
    analyze_dqi_scores()
    get_raw_values_for_high_dqi()
    recommend_new_thresholds()
    
    print("\n" + "="*80)
    print("DIAGNOSIS COMPLETE")
    print("="*80)
