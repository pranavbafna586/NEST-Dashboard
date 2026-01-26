import pandas as pd
import numpy as np
import os

def fill_latest_visit_and_status(subject_metrics, sv_data, missing_pages):
    """
    Fill Latest Visit (SV) from SV tab, only if missing
    """
    df = subject_metrics.copy()
    
    # Pre-process SV data: get latest visit for each subject in one operation
    sv_latest = (sv_data
                 .sort_values('Visit Date', ascending=False)
                 .groupby(['Project Name', 'Site ID', 'Subject ID'], as_index=False)
                 .first()
                 [['Project Name', 'Site ID', 'Subject ID', 'Visit Name']])
    
    # Identify rows where Latest Visit (SV) is missing
    mask = df['Latest Visit (SV)'].isna() | (df['Latest Visit (SV)'] == '')
    
    # Merge only for rows with missing data
    if mask.any():
        df_missing = df[mask].copy()
        df_filled = df_missing.merge(
            sv_latest,
            on=['Project Name', 'Site ID', 'Subject ID'],
            how='left',
            suffixes=('', '_new')
        )
        
        # Update only where we have new data
        df.loc[mask, 'Latest Visit (SV)'] = df_filled['Visit Name'].values
    
    return df

def fill_missing_visits(subject_metrics, visit_projection):
    """Fill Missing Visits count - optimized with merge"""
    df = subject_metrics.copy()
    
    # Group and count missing visits per subject
    missing_visits_count = (visit_projection
                           .groupby(['Project Name', 'Site ID', 'Subject ID'])
                           .size()
                           .reset_index(name='Missing Visits'))
    
    # Merge instead of iterating
    df = df.merge(
        missing_visits_count,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    
    # Update column, filling NaN with 0
    if 'Missing Visits_new' in df.columns:
        df['Missing Visits'] = df['Missing Visits_new'].fillna(0).astype(int)
        df.drop('Missing Visits_new', axis=1, inplace=True)
    else:
        df['Missing Visits'] = df['Missing Visits'].fillna(0).astype(int)
    
    return df

def fill_missing_pages(subject_metrics, missing_pages):
    """Fill Missing Page count - optimized with merge"""
    df = subject_metrics.copy()
    
    # Group and count missing pages per subject
    missing_pages_count = (missing_pages
                          .groupby(['Project Name', 'Site ID', 'Subject ID'])
                          .size()
                          .reset_index(name='Missing Page'))
    
    # Merge instead of iterating
    df = df.merge(
        missing_pages_count,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    
    # Update column, filling NaN with 0
    if 'Missing Page_new' in df.columns:
        df['Missing Page'] = df['Missing Page_new'].fillna(0).astype(int)
        df.drop('Missing Page_new', axis=1, inplace=True)
    else:
        df['Missing Page'] = df['Missing Page'].fillna(0).astype(int)
    
    return df

def fill_coded_uncoded_terms(subject_metrics, global_meddra, global_whodd):
    """
    Fill Coded Terms and Uncoded Terms from GlobalCodingReport_MedDRA and GlobalCodingReport_WHODD
    Note: Global coding reports don't have Site ID in the database schema
    """
    df = subject_metrics.copy()
    
    # Combine both coding reports
    combined_coding = pd.concat([global_meddra, global_whodd], ignore_index=True)
    
    # Pre-compute coded and uncoded counts per subject
    coded_mask = combined_coding['Coding Status'].notna()
    uncoded_mask = (
        (combined_coding['Require Coding'].astype(str).str.lower() == 'yes') | 
        (combined_coding['Coding Status'].isna())
    )
    
    # Group by Project Name and Subject ID to get counts (no Site ID)
    coded_counts = (combined_coding[coded_mask]
                    .groupby(['Project Name', 'Subject ID'])
                    .size()
                    .reset_index(name='coded_count'))
    
    uncoded_counts = (combined_coding[uncoded_mask]
                      .groupby(['Project Name', 'Subject ID'])
                      .size()
                      .reset_index(name='uncoded_count'))
    
    # Merge coded counts
    df = df.merge(
        coded_counts,
        on=['Project Name', 'Subject ID'],
        how='left'
    )
    df['Coded terms'] = df['coded_count'].fillna(0).astype(int)
    df.drop('coded_count', axis=1, inplace=True)
    
    # Merge uncoded counts
    df = df.merge(
        uncoded_counts,
        on=['Project Name', 'Subject ID'],
        how='left'
    )
    df['Uncoded Terms'] = df['uncoded_count'].fillna(0).astype(int)
    df.drop('uncoded_count', axis=1, inplace=True)
    
    return df

def fill_open_issues_lnr(subject_metrics, missing_lab):
    """Fill Open issues in LNR - optimized with merge"""
    df = subject_metrics.copy()
    
    # Count issues per subject
    issues_count = (missing_lab
                   .groupby(['Project Name', 'Site ID', 'Subject ID'])
                   .size()
                   .reset_index(name='Open issues in LNR'))
    
    # Merge instead of iterating
    df = df.merge(
        issues_count,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    
    # Update column, filling NaN with 0
    if 'Open issues in LNR_new' in df.columns:
        df['Open issues in LNR'] = df['Open issues in LNR_new'].fillna(0).astype(int)
        df.drop('Open issues in LNR_new', axis=1, inplace=True)
    else:
        df['Open issues in LNR'] = df['Open issues in LNR'].fillna(0).astype(int)
    
    return df

def fill_open_issues_edrr(subject_metrics, compiled_edrr):
    """
    Fill Open Issues EDRR - optimized with merge
    Note: EDRR issues table doesn't have Site ID in the database schema
    """
    df = subject_metrics.copy()
    
    # Merge instead of iterating (only on Project Name and Subject ID)
    df = df.merge(
        compiled_edrr[['Project Name', 'Subject ID', 'Total Open Issue Count']],
        on=['Project Name', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    
    # Update column, filling NaN with 0
    if 'Total Open Issue Count' in df.columns:
        df['Open Issues reported for 3rd party reconciliation in EDRR'] = df['Total Open Issue Count'].fillna(0).astype(int)
        df.drop('Total Open Issue Count', axis=1, inplace=True)
    
    return df

def fill_inactivated_forms(subject_metrics, inactivated_forms):
    """Fill Inactivated forms - optimized with merge"""
    df = subject_metrics.copy()
    
    # Count inactivated items per subject
    # Site ID should already be populated by extract_data.populate_site_id_in_dataframes()
    inactivated_count = (inactivated_forms
                        .groupby(['Project Name', 'Site ID', 'Subject ID'])
                        .size()
                        .reset_index(name='Inactivated forms and folders'))
    
    # Merge instead of iterating
    df = df.merge(
        inactivated_count,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    
    # Update column, filling NaN with 0
    if 'Inactivated forms and folders_new' in df.columns:
        df['Inactivated forms and folders'] = df['Inactivated forms and folders_new'].fillna(0).astype(int)
        df.drop('Inactivated forms and folders_new', axis=1, inplace=True)
    else:
        df['Inactivated forms and folders'] = df['Inactivated forms and folders'].fillna(0).astype(int)
    
    return df

def fill_esae_dashboard(subject_metrics, esae_dm, esae_safety):
    """Fill eSAE dashboard - optimized with merge"""
    df = subject_metrics.copy()
    
    # Count DM issues per subject
    dm_counts = (esae_dm
                .groupby(['Project Name', 'Site ID', 'Subject ID'])
                .size()
                .reset_index(name='eSAE dashboard review for DM'))
    
    # Count Safety issues per subject
    safety_counts = (esae_safety
                    .groupby(['Project Name', 'Site ID', 'Subject ID'])
                    .size()
                    .reset_index(name='eSAE dashboard review for safety'))
    
    # Merge DM counts
    df = df.merge(
        dm_counts,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    if 'eSAE dashboard review for DM_new' in df.columns:
        df['eSAE dashboard review for DM'] = df['eSAE dashboard review for DM_new'].fillna(0).astype(int)
        df.drop('eSAE dashboard review for DM_new', axis=1, inplace=True)
    
    # Merge Safety counts
    df = df.merge(
        safety_counts,
        on=['Project Name', 'Site ID', 'Subject ID'],
        how='left',
        suffixes=('', '_new')
    )
    if 'eSAE dashboard review for safety_new' in df.columns:
        df['eSAE dashboard review for safety'] = df['eSAE dashboard review for safety_new'].fillna(0).astype(int)
        df.drop('eSAE dashboard review for safety_new', axis=1, inplace=True)
    
    return df

def fill_crfs_with_queries_and_nonconformant(subject_metrics, non_conformant, query_report):
    """Fill Total CRFs with queries & Non-Conformant - optimized"""
    df = subject_metrics.copy()
    
    # Determine form column name
    nc_form_col = 'Form Name' if 'Form Name' in non_conformant.columns else 'Log #'
    qr_form_col = 'Form Name' if 'Form Name' in query_report.columns else 'Log #'
    
    # Get unique forms per subject for NC
    nc_forms = (non_conformant
               .groupby(['Project Name', 'Site ID', 'Subject ID'])[nc_form_col]
               .apply(lambda x: set(x.dropna().unique()))
               .reset_index(name='nc_forms'))
    
    # Get unique forms per subject for Query Report
    qr_forms = (query_report
               .groupby(['Project Name', 'Site ID', 'Subject ID'])[qr_form_col]
               .apply(lambda x: set(x.dropna().unique()))
               .reset_index(name='qr_forms'))
    
    # Merge both
    df = df.merge(nc_forms, on=['Project Name', 'Site ID', 'Subject ID'], how='left')
    df = df.merge(qr_forms, on=['Project Name', 'Site ID', 'Subject ID'], how='left')
    
    # Calculate intersection
    df['Total CRFs with queries & Non-Conformant data'] = df.apply(
        lambda row: len(row['nc_forms'].intersection(row['qr_forms'])) 
        if pd.notna(row['nc_forms']) and pd.notna(row['qr_forms']) 
        else 0,
        axis=1
    )
    
    df.drop(['nc_forms', 'qr_forms'], axis=1, inplace=True)
    
    return df

def fill_crfs_without_queries(subject_metrics, non_conformant, query_report):
    """Fill Total CRFs without queries - optimized"""
    df = subject_metrics.copy()
    
    # Determine form column name
    nc_form_col = 'Form Name' if 'Form Name' in non_conformant.columns else 'Log #'
    qr_form_col = 'Form Name' if 'Form Name' in query_report.columns else 'Log #'
    
    # Get unique forms per subject for NC
    nc_forms = (non_conformant
               .groupby(['Project Name', 'Site ID', 'Subject ID'])[nc_form_col]
               .apply(lambda x: set(x.dropna().unique()))
               .reset_index(name='nc_forms'))
    
    # Get unique forms per subject for Query Report
    qr_forms = (query_report
               .groupby(['Project Name', 'Site ID', 'Subject ID'])[qr_form_col]
               .apply(lambda x: set(x.dropna().unique()))
               .reset_index(name='qr_forms'))
    
    # Merge both
    df = df.merge(nc_forms, on=['Project Name', 'Site ID', 'Subject ID'], how='left')
    df = df.merge(qr_forms, on=['Project Name', 'Site ID', 'Subject ID'], how='left')
    
    # Calculate difference (NC only)
    df['Total CRFs without queries & Non-Conformant data'] = df.apply(
        lambda row: len(row['nc_forms'] - row['qr_forms']) 
        if pd.notna(row['nc_forms']) and pd.notna(row['qr_forms']) 
        else (len(row['nc_forms']) if pd.notna(row['nc_forms']) else 0),
        axis=1
    )
    
    df.drop(['nc_forms', 'qr_forms'], axis=1, inplace=True)
    
    return df

def calculate_percentage_clean_crf(subject_metrics):
    """Calculate % Clean Entered CRF - vectorized"""
    df = subject_metrics.copy()
    
    # Vectorized calculation
    pages_entered = df['Pages Entered'].fillna(0)
    pages_nc = df['Pages with Non-Conformant data'].fillna(0)
    
    # Avoid division by zero
    df['Percentage Clean Entered CRF'] = np.where(
        pages_entered > 0,
        ((pages_entered - pages_nc) * 100 / pages_entered).round(2),
        0
    )
    
    return df

def populate_site_id_in_esae(subject_metrics, esae_dm, esae_safety):
    """
    Populate Site ID in eSAE Dashboard dataframes from Subject Level Metrics if missing
    """
    # Create lookup dictionary from subject metrics: (Project Name, Subject ID) -> Site ID
    site_lookup = {}
    for _, row in subject_metrics.iterrows():
        key = (row['Project Name'], row['Subject ID'])
        site_lookup[key] = row['Site ID']
    
    # Fill Site ID in SAE Dashboard_DM
    for idx, row in esae_dm.iterrows():
        if pd.isna(row.get('Site ID')) or row.get('Site ID') is None or row.get('Site ID') == '-':
            key = (row.get('Project Name'), row.get('Subject ID'))
            if key in site_lookup:
                esae_dm.at[idx, 'Site ID'] = site_lookup[key]
    
    # Fill Site ID in SAE Dashboard_Safety
    for idx, row in esae_safety.iterrows():
        if pd.isna(row.get('Site ID')) or row.get('Site ID') is None or row.get('Site ID') == '-':
            key = (row.get('Project Name'), row.get('Subject ID'))
            if key in site_lookup:
                esae_safety.at[idx, 'Site ID'] = site_lookup[key]
    
    return esae_dm, esae_safety

def fill_all_missing_data(dataframes):
    """
    Main function to orchestrate all filling operations
    Note: populate_site_id_in_esae should be called BEFORE this function
    """
    subject_metrics = dataframes['Subject_Level_Metrics'].copy()

    subject_metrics = fill_latest_visit_and_status(
        subject_metrics, 
        dataframes['SV'],
        dataframes['All Pages Missing']
    )

    subject_metrics = fill_missing_visits(subject_metrics, dataframes['Visit_Projection_Tracker'])

    subject_metrics = fill_missing_pages(subject_metrics, dataframes['All Pages Missing'])

    subject_metrics = fill_coded_uncoded_terms(
        subject_metrics, 
        dataframes['GlobalCoding_MedDRA'], 
        dataframes['GlobalCoding_WHODD']
    )

    subject_metrics = fill_open_issues_lnr(subject_metrics, dataframes['Missing_Lab'])

    subject_metrics = fill_open_issues_edrr(subject_metrics, dataframes['Compiled_EDRR'])

    subject_metrics = fill_inactivated_forms(subject_metrics, dataframes['Inactivated_Forms'])

    subject_metrics = fill_esae_dashboard(
        subject_metrics, 
        dataframes['SAE Dashboard_DM'], 
        dataframes['SAE Dashboard_Safety']
    )

    subject_metrics = fill_crfs_with_queries_and_nonconformant(
        subject_metrics, 
        dataframes['Non conformant'], 
        dataframes['Query Report - Cumulative']
    )

    subject_metrics = fill_crfs_without_queries(
        subject_metrics, 
        dataframes['Non conformant'], 
        dataframes['Query Report - Cumulative']
    )

    subject_metrics = calculate_percentage_clean_crf(subject_metrics)

    return subject_metrics

if __name__ == "__main__":
    # Import here to avoid circular dependency
    from extract_data import extract_all_data
    
    # Extract all data for Study 1
    print("Extracting data from Excel files...")
    dataframes = extract_all_data(project_name="Study 21")
    
    # Fill missing data
    filled_subject_metrics = fill_all_missing_data(dataframes)
    
    # Save the filled data
    output_file = os.getcwd() + r"filled_subject_metrics.xlsx"
    filled_subject_metrics.to_excel(output_file, index=False)
    print(f"\nFilled Subject Metrics saved to: {output_file}")
    
    # Display summary
    print("\nSummary of filled data:")
    print(f"Total subjects: {filled_subject_metrics.shape[0]}")
    print(f"Total columns: {filled_subject_metrics.shape[1]}")
    
    # Show sample of filled data
    print("\nFirst 5 rows of key filled columns:")
    key_cols = ['Subject ID', 'Missing Visits', 'Missing Page', 'Coded terms', 
                'Uncoded Terms', 'Pages with Non-Conformant data', 'Percentage Clean Entered CRF']
    if all(col in filled_subject_metrics.columns for col in key_cols):
        print(filled_subject_metrics[key_cols].head())
