import pandas as pd
import os
from pathlib import Path
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
warnings.filterwarnings('ignore')

# Base directory for study files - will be constructed using project name
def get_base_dir(project_name):
    """Get base directory for a specific project"""
    return os.path.join(os.getcwd(), "Study Files", project_name)

# Column name standardization mapping
COLUMN_MAPPING = {
    # Standardize Study/Project names
    'Study': 'Project Name',
    'Study ID': 'Project Name',
    'Project Name': 'Project Name',
    
    # Standardize Subject names
    'Subject': 'Subject ID',
    'Subject Name': 'Subject ID',
    'Patient ID': 'Subject ID',
    
    # Standardize Site names
    'Site': 'Site ID',
    'Site Number': 'Site ID',
    'Site ID': 'Site ID',
    'Study Site Number': 'Site ID',
    'Study Site': 'Site ID',
    
    # Standardize Visit names
    'Visit': 'Visit Name',
    'Visit Name': 'Visit Name',
    'Folder Name': 'Visit Name',
    
    # Standardize Form/Page names
    'Form': 'Form Name',
    'Form ': 'Form Name',
    'Page': 'Form Name',
    'Data Page Name': 'Form Name',
    'Page Name': 'Form Name',
    
    # Standardize dates
    'Visit date': 'Visit Date',
    'Visit Date': 'Visit Date',
    
    # Other standardizations
    'Log': 'Logline',
    'Country': 'Country',
    'Region': 'Region'
}

@lru_cache(maxsize=1)
def get_column_mapping():
    """Cache the column mapping dictionary"""
    return COLUMN_MAPPING

def convert_to_date(df, column_name):
    """Convert datetime column to date only - robust handling for SQLite compatibility"""
    if column_name not in df.columns:
        return df
    
    # Create a copy to avoid SettingWithCopyWarning
    result = []
    
    for value in df[column_name]:
        # Skip if already None or NaN
        if pd.isna(value):
            result.append(None)
            continue

        
        try:
            # If already a date object, convert to string for SQLite
            if isinstance(value, pd.Timestamp):
                result.append(value.strftime('%Y-%m-%d'))
            elif hasattr(value, 'strftime'):  # datetime.date or datetime.datetime
                result.append(value.strftime('%Y-%m-%d'))
            else:
                # Try parsing string values with multiple formats
                parsed = pd.to_datetime(value, errors='coerce')
                if pd.notna(parsed):
                    result.append(parsed.strftime('%Y-%m-%d'))
                else:
                    result.append(None)
        except Exception:
            result.append(None)
    
    df[column_name] = result
    return df

def convert_to_date_batch(df, column_names):
    """Convert multiple datetime columns to date only in one pass"""
    for col in column_names:
        if col in df.columns:
            df[col] = pd.to_datetime(
                df[col], 
                format='%d-%b-%y',  # This matches '28-Mar-25'
                errors='coerce'
            ).dt.date
            # Fallback to default parsing for any remaining NaT values
            df[col] = pd.to_datetime(
                df[col], 
                errors='coerce'
            ).dt.date
    return df

def standardize_columns(df, mapping=None):
    """Standardize column names across dataframes - optimized"""
    if mapping is None:
        mapping = get_column_mapping()
    df.columns = [mapping.get(col, col) for col in df.columns]
    return df

def extract_cpid_edc_metrics(project_name):
    """Extract CPID_EDC_Metrics.xlsx - Subject Level Metrics sheet"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "CPID_EDC_Metrics.xlsx")
    
    # Read the first sheet (Subject Level Metrics)
    df = pd.read_excel(file_path, sheet_name=0, header=None, index_col=False)
    
    # Remove header rows and footer
    df = df[4:-1]
    
    # Set standardized column names
    df.columns = [
        'Project Name', 'Region', 'Country', 'Site ID', 'Subject ID', 
        'Latest Visit (SV)', 'Subject Status', 'Missing Visits', 'Missing Page', 
        'Coded terms', 'Uncoded Terms', 'Open issues in LNR', 
        'Open Issues reported for 3rd party reconciliation in EDRR', 
        'Inactivated forms and folders', 'eSAE dashboard review for DM', 
        'eSAE dashboard review for safety', 'Expected Visits', 'Pages Entered', 
        'Pages with Non-Conformant data', 'Total CRFs with queries & Non-Conformant data', 
        'Total CRFs without queries & Non-Conformant data', 'Percentage Clean Entered CRF', 
        'DM Queries', 'Clinical Queries', 'Medical Queries', 'Site Queries', 
        'Field Monitor Queries', 'Coding Queries', 'Safety Queries', 'Total Queries', 
        'CRFs Require Verification (SDV)', 'Forms Verified', 'CRFs Frozen', 
        'CRFs Not Frozen', 'CRFs Locked', 'CRFs Unlocked', 'PDs Confirmed', 
        'PDs Proposed', 'CRFs Signed', 
        'CRFs overdue for signs within 45 days of Data entry', 
        'CRFs overdue for signs between 45 to 90 days of Data entry', 
        'CRFs overdue for signs beyond 90 days of Data entry', 
        'Broken Signatures', 'CRFs Never Signed'
    ]
    
    # Clean up 'Latest Visit (SV)' column to remove trailing numbers in parentheses
    if 'Latest Visit (SV)' in df.columns:
        df['Latest Visit (SV)'] = df['Latest Visit (SV)'].astype(str).str.replace(r'\s*\(\d+\)$', '', regex=True)
    
    # Columns to convert to integer
    int_columns = [
        'Missing Visits', 'Missing Page', 'Coded terms', 'Uncoded Terms', 'Open issues in LNR',
        'Open Issues reported for 3rd party reconciliation in EDRR', 'Inactivated forms and folders',
        'eSAE dashboard review for DM', 'eSAE dashboard review for safety', 'Expected Visits',
        'Pages Entered', 'Pages with Non-Conformant data', 'Total CRFs with queries & Non-Conformant data',
        'Total CRFs without queries & Non-Conformant data', 'DM Queries', 'Clinical Queries',
        'Medical Queries', 'Site Queries', 'Field Monitor Queries', 'Coding Queries', 'Safety Queries',
        'Total Queries', 'CRFs Require Verification (SDV)', 'Forms Verified', 'CRFs Frozen',
        'CRFs Not Frozen', 'CRFs Locked', 'CRFs Unlocked', 'PDs Confirmed', 'PDs Proposed',
        'CRFs Signed', 'CRFs overdue for signs within 45 days of Data entry',
        'CRFs overdue for signs between 45 to 90 days of Data entry',
        'CRFs overdue for signs beyond 90 days of Data entry', 'Broken Signatures', 'CRFs Never Signed'
    ]
    for col in int_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')
    
    # Convert percentage column to float
    if 'Percentage Clean Entered CRF' in df.columns:
        df['Percentage Clean Entered CRF'] = pd.to_numeric(df['Percentage Clean Entered CRF'], errors='coerce').astype(float)
    
    return df

def extract_cpid_other_sheets(project_name):
    """Extract other sheets from CPID_EDC_Metrics.xlsx - optimized with parallel reading"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "CPID_EDC_Metrics.xlsx")
    
    dataframes = {}
    
    # Sheet configurations with date columns to optimize
    sheet_configs = {
        'Query Report - Cumulative': ['Visit Date', 'Query Open Date', 'Query Response Date'],
        'Non conformant': ['Visit Date'],
        'PI Signature Report': ['Visit Date', 'Date page entered/ Date last PI Sign'],
        'SDV': ['Visit Date'],
        'Protocol Deviation': ['Visit Date'],
        'CRF Freeze': ['Visit Date'],
        'CRF UnFreeze': ['Visit Date'],
        'CRF Locked': ['Visit Date'],
        'CRF UnLocked': ['Visit Date'],
        'SV': ['Visit Date']
    }
    
    # Read all sheets in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_sheet = {
            executor.submit(pd.read_excel, file_path, sheet_name=sheet_name, header=0): 
            (sheet_name, date_cols)
            for sheet_name, date_cols in sheet_configs.items()
        }
        
        for future in as_completed(future_to_sheet):
            sheet_name, date_cols = future_to_sheet[future]
            try:
                df = future.result()
                df = standardize_columns(df)
                
                # Batch convert date columns
                df = convert_to_date_batch(df, date_cols)
                
                # Add Project Name column if not present
                if 'Project Name' not in df.columns:
                    df.insert(0, 'Project Name', project_name)
                
                dataframes[sheet_name] = df
            except Exception as e:
                print(f"Error reading {sheet_name}: {e}")
    
    return dataframes

def extract_compiled_edrr(project_name):
    """Extract Compiled_EDRR.xlsx"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "Compiled_EDRR.xlsx")
    
    df = pd.read_excel(file_path, sheet_name=0, header=0)
    df = standardize_columns(df)
    
    # Rename specific columns
    if 'Total Open issue Count per subject' in df.columns:
        df = df.rename(columns={'Total Open issue Count per subject': 'Total Open Issue Count'})
    
    # Remove rows where 'Subject ID' is missing or NA
    if 'Subject ID' in df.columns:
        df = df[df['Subject ID'].notna()]
    
    # Add Project Name if not present
    if 'Project Name' not in df.columns:
        df.insert(0, 'Project Name', project_name)
    
    return df

def extract_esae_dashboard(project_name):
    """Extract eSAE_Dashboard_Standard_DM_Safety_Report.xlsx"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "eSAE_Dashboard_Standard_DM_Safety_Report.xlsx")
    
    dataframes = {}
    
    # SAE Dashboard_DM sheet
    df_dm = pd.read_excel(file_path, sheet_name='SAE Dashboard_DM', header=0)
    df_dm = standardize_columns(df_dm)
    
    # Add Site ID column if not present (will be filled from subject metrics later)
    if 'Site ID' not in df_dm.columns:
        df_dm['Site ID'] = None
    
    dataframes['SAE Dashboard_DM'] = df_dm
    
    # SAE Dashboard_Safety sheet
    df_safety = pd.read_excel(file_path, sheet_name='SAE Dashboard_Safety', header=0)
    df_safety = standardize_columns(df_safety)
    
    # Add Site ID column if not present (will be filled from subject metrics later)
    if 'Site ID' not in df_safety.columns:
        df_safety['Site ID'] = None
    
    dataframes['SAE Dashboard_Safety'] = df_safety
    
    return dataframes

def extract_global_coding_report(dictionary_type, project_name):
    """Extract GlobalCodingReport_MedDRA.xlsx or GlobalCodingReport_WHODD.xlsx"""
    base_dir = get_base_dir(project_name)
    file_name = f"GlobalCodingReport_{dictionary_type}.xlsx"
    file_path = os.path.join(base_dir, file_name)
    
    df = pd.read_excel(file_path, sheet_name=0, header=0)
    df = standardize_columns(df)
    
    # Remove the first column if it's a report title
    if df.columns[0] in ['MedDRA Coding Report', 'WHODrug Coding Report']:
        df = df.iloc[:, 1:]
    
    # Add Project Name column if not present
    if 'Project Name' not in df.columns:
        df.insert(0, 'Project Name', project_name)
    
    return df

def extract_inactivated_forms(project_name):
    """Extract Inactivated_Forms_Folders_Records_Report.xlsx"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "Inactivated_Forms_Folders_Records_Report.xlsx")
    
    df = pd.read_excel(file_path, sheet_name=0, header=0)
    df = standardize_columns(df)
    
    # Rename specific columns
    column_renames = {
        'Folder': 'Visit Name',
        'Form': 'Form Name',
        'Data on Form/Record': 'Data on Form/Record',
        'RecordPosition': 'Record Position'
    }
    df = df.rename(columns=column_renames)
    
    # Remove rows where 'Subject ID' is missing, NA, or empty
    if 'Subject ID' in df.columns:
        df = df[df['Subject ID'].notna() & (df['Subject ID'].astype(str).str.strip() != "")]
    
    # Add Project Name column if not present
    if 'Project Name' not in df.columns:
        df.insert(0, 'Project Name', project_name)
    
    return df

def extract_missing_lab(project_name):
    """Extract Missing_Lab_Name_and_Missing_Ranges.xlsx"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "Missing_Lab_Name_and_Missing_Ranges.xlsx")
    
    df = pd.read_excel(file_path, sheet_name=0, header=0)
    df = standardize_columns(df)
    
    # Rename specific columns
    column_renames = {
        'Site number': 'Site ID',
        'Visit': 'Visit Name'
    }
    df = df.rename(columns=column_renames)
    
    # Convert Lab Date to date only
    df = convert_to_date(df, 'Lab Date')
    
    # Add Project Name column if not present
    if 'Project Name' not in df.columns:
        df.insert(0, 'Project Name', project_name)
    
    return df

def extract_missing_pages(project_name):
    """Extract Missing_Pages_Report.xlsx - only first sheet (All Pages Missing)"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "Missing_Pages_Report.xlsx")

    # Helper: Standardize columns for all studies
    def _standardize_missing_pages_columns(df):
        # Mapping for all possible column names to standard names
        col_map = {
            # Study/Project
            'Study': 'Project Name',
            'Study Name': 'Project Name',
            # Country/Site
            'Country': 'Country',
            'SiteGroupName(CountryName)': 'Country',
            'Site Number': 'Site ID',
            'SiteNumber': 'Site ID',
            # Subject
            'Subject Name': 'Subject ID',
            'SubjectName': 'Subject ID',
            'Subject': 'Subject ID',
            # Visit/Folder
            'Visit': 'Visit Name',
            'Visit Name': 'Visit Name',
            'Folder Name': 'Visit Name',
            'FolderName': 'Visit Name',
            # Page/Form
            'Page Name': 'Form Name',
            'FormName': 'Form Name',
            'Form': 'Form Name',
            # Visit Date
            'Visit date': 'Visit Date',
            'Visit Date': 'Visit Date',
            # Status
            'Subject Status': 'Subject Status',
            'Overall Subject Status': 'Subject Status',
            'Visit Level Subject Status': 'Visit Level Subject Status',
            # Form Details -> Form Type
            'Form Details': 'Form Type',
            # Form Type
            'Form Type (Summary or Visit)': 'Form Type',
            # Days missing
            '# of Days Missing': 'Days Missing',
            'No. #Days Page Missing': 'Days Missing',
            '#Days Page Missing': 'Days Missing',
            'No. #Days Page Missing ': 'Days Missing',
            # Screening Visit Date
            'Screening Visit Date': 'Screening Visit Date'
        }
        # Remove leading/trailing spaces in column names
        df.columns = [c.strip() for c in df.columns]
        # Map columns
        df = df.rename(columns=lambda c: col_map.get(c, c))
        return df

    # Read only the first sheet
    df = pd.read_excel(file_path, sheet_name=0, header=0)
    # Drop 'Form 1 Subject Status' column if present
    if 'Form 1 Subject Status' in df.columns:
        df = df.drop(columns=['Form 1 Subject Status'])
    df = _standardize_missing_pages_columns(df)
    
    # Convert Visit Date to date only
    df = convert_to_date(df, 'Visit Date')
    
    # Add Project Name column if not present
    if 'Project Name' not in df.columns:
        df.insert(0, 'Project Name', project_name)
    
    return {'All Pages Missing': df}

def extract_visit_projection(project_name):
    """Extract Visit_Projection_Tracker.xlsx"""
    base_dir = get_base_dir(project_name)
    file_path = os.path.join(base_dir, "Visit_Projection_Tracker.xlsx")
    
    # Read the sheet without assuming header to handle variable header rows
    df = pd.read_excel(file_path, sheet_name='Missing Visits', header=None)
    df = df.dropna()
    
    # Find the row index where 'Country' appears in the first column
    header_row: int | None = None
    for i in range(len(df)):
        if df.iloc[i, 0] == 'Country':
            header_row = i
            break
    
    if header_row is not None:
        # Set the header and drop the rows before it
        df.columns = df.iloc[header_row]
        df = df.iloc[header_row + 1:].reset_index(drop=True)
    else:
        # Fallback: assume standard header if 'Country' not found
        print("Warning: 'Country' column not found in first column. Using default header row.")
        df = pd.read_excel(file_path, sheet_name='Missing Visits', header=0)
    
    df = standardize_columns(df)
    
    # Rename specific columns
    column_renames = {
        'Visit': 'Visit Name',
        '# Days Outstanding': 'Days Outstanding',
        "# Days Outstanding (TODAY - PROJECTEDDATE)": 'Days Outstanding',
        "# Days Outstanding (TODAY - PROJECTED\nDATE)": 'Days Outstanding'
    }
    df = df.rename(columns=column_renames)
    
    # Convert Projected Date to date only
    df = convert_to_date(df, 'Projected Date')
    
    # Add Project Name column only to rows with a Subject ID
    if 'Project Name' not in df.columns:
        df['Project Name'] = None
    if 'Subject ID' in df.columns:
        df.loc[df['Subject ID'].notna(), 'Project Name'] = project_name
    
    # print(df)

    return df

def extract_all_data_parallel(project_name="Study 1"):
    """Main function to extract all data with parallel processing"""
    all_dataframes = {}
    base_dir = get_base_dir(project_name)
    
    # Define extraction tasks
    extraction_tasks = {
        'Subject_Level_Metrics': lambda: extract_cpid_edc_metrics(project_name),
        'Compiled_EDRR': lambda: extract_compiled_edrr(project_name),
        'GlobalCoding_MedDRA': lambda: extract_global_coding_report('MedDRA', project_name),
        'GlobalCoding_WHODD': lambda: extract_global_coding_report('WHODD', project_name),
        'Inactivated_Forms': lambda: extract_inactivated_forms(project_name),
        'Missing_Lab': lambda: extract_missing_lab(project_name),
        'Visit_Projection_Tracker': lambda: extract_visit_projection(project_name),
    }
    
    # Execute extractions in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_name = {
            executor.submit(task): name 
            for name, task in extraction_tasks.items()
        }
        
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                result = future.result()
                if isinstance(result, dict):
                    all_dataframes.update(result)
                else:
                    all_dataframes[name] = result
            except Exception as e:
                print(f"Error extracting {name}: {e}")
    
    # Extract sheets that depend on each other sequentially
    try:
        cpid_sheets = extract_cpid_other_sheets(project_name)
        all_dataframes.update(cpid_sheets)
    except Exception as e:
        print(f"Error extracting CPID sheets: {e}")
    
    try:
        esae_sheets = extract_esae_dashboard(project_name)
        all_dataframes.update(esae_sheets)
    except Exception as e:
        print(f"Error extracting eSAE sheets: {e}")
    
    try:
        missing_pages_sheets = extract_missing_pages(project_name)
        all_dataframes.update(missing_pages_sheets)
    except Exception as e:
        print(f"Error extracting missing pages: {e}")
    
    return all_dataframes

def populate_site_id_in_dataframes(all_dataframes):
    """
    Populate missing Site IDs in various dataframes using Subject Level Metrics as reference
    This should be called after all data is extracted
    Only populate for dataframes where Site ID is required in the database schema
    """
    if 'Subject_Level_Metrics' not in all_dataframes:
        print("Warning: Subject Level Metrics not found, cannot populate Site IDs")
        return all_dataframes
    
    subject_metrics = all_dataframes['Subject_Level_Metrics']
    
    # Create lookup dictionary: (Project Name, Subject ID) -> Site ID
    site_lookup = subject_metrics.set_index(['Project Name', 'Subject ID'])['Site ID'].to_dict()
    
    # List of dataframes that require Site ID based on database schema
    # Excluded: GlobalCoding_MedDRA, GlobalCoding_WHODD, Compiled_EDRR (no site_id in their tables)
    dataframes_to_check = [
        'Inactivated_Forms',
        'Missing_Lab'
    ]
    
    for df_name in dataframes_to_check:
        if df_name not in all_dataframes:
            continue
        
        df = all_dataframes[df_name]
        
        # Check if Site ID column exists and has missing values
        if 'Site ID' not in df.columns:
            df['Site ID'] = None
            # print(f"Added Site ID column to {df_name}")
        
        # Count missing Site IDs
        missing_count = df['Site ID'].isna().sum()
        
        if missing_count > 0:
            # print(f"Populating {missing_count} missing Site IDs in {df_name}...")
            
            # Populate Site ID using the lookup
            df['Site ID'] = df.apply(
                lambda row: site_lookup.get(
                    (row.get('Project Name'), row.get('Subject ID')), 
                    row.get('Site ID')
                ),
                axis=1
            )
            
            # Update the dataframe in the dictionary
            all_dataframes[df_name] = df
            
            # Report results
            still_missing = df['Site ID'].isna().sum()
            populated = missing_count - still_missing
            # print(f"  ✓ Populated {populated} Site IDs in {df_name}")
            if still_missing > 0:
                print(f"  ⚠ {still_missing} Site IDs still missing (no match found)")
    
    return all_dataframes

def extract_all_data(project_name="Study 1"):
    """Main function to extract all data - now uses parallel processing and populates Site IDs"""
    all_dataframes = extract_all_data_parallel(project_name)
    
    # Populate missing Site IDs after all data is extracted
    all_dataframes = populate_site_id_in_dataframes(all_dataframes)
    
    return all_dataframes

if __name__ == "__main__":
    dataframes = extract_all_data(project_name="Study 11")
    
    # Save all dataframes to a single Excel file with multiple sheets
    # output_file = os.path.join("", "extracted_data.xlsx")
    # with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    #     for sheet_name, df in dataframes.items():
    #         df.to_excel(writer, sheet_name=sheet_name, index=False)
    # print(f"All data extracted and saved to {output_file}")
