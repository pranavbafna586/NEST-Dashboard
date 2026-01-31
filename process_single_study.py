import os
import sys
import time
from dotenv import load_dotenv
from extract_data import extract_all_data
from fill_missing_values import fill_all_missing_data, populate_site_id_in_esae
from data_insertion import insert_all_data
from dqi_clean_status_cal import calculate_all_dqi_and_clean_status

load_dotenv()

# Configuration
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

def process_single_study(study_name):
    """Process a single study: extract, fill, insert data, and calculate DQI"""
    print("="*70)
    print(f"PROCESSING STUDY: {study_name}")
    print("="*70)
    
    try:
        # Step 1: Extract data
        print(f"\nStep 1: Extracting data from {study_name}...")
        start_time = time.time()
        dataframes = extract_all_data(project_name=study_name)
        print(f"  -> Data extraction completed ({time.time() - start_time:.2f}s)")
        
        # Step 2: Populate Site ID in eSAE Dashboard
        print(f"\nStep 2: Populating Site ID in eSAE Dashboard...")
        dataframes['SAE Dashboard_DM'], dataframes['SAE Dashboard_Safety'] = populate_site_id_in_esae(
            dataframes['Subject_Level_Metrics'],
            dataframes['SAE Dashboard_DM'],
            dataframes['SAE Dashboard_Safety']
        )
        print("  -> Site IDs populated")
        
        # Step 3: Fill missing values
        print(f"\nStep 3: Filling missing values...")
        filled_subject_metrics = fill_all_missing_data(dataframes)
        print("  -> Missing values filled")
        
        # Step 4: Insert data into database
        print(f"\nStep 4: Inserting data into database...")
        start_time = time.time()
        insert_all_data(dataframes, filled_subject_metrics)
        print(f"  -> Data inserted successfully ({time.time() - start_time:.2f}s)")
        
        # Step 5: Calculate DQI and Clean Status (for all subjects)
        print(f"\nStep 5: Calculating DQI and Clean Status...")
        start_time = time.time()
        calculate_all_dqi_and_clean_status()
        print(f"  -> DQI calculation completed ({time.time() - start_time:.2f}s)")
        
        print("\n" + "="*70)
        print(f"SUCCESS: Study '{study_name}' processed successfully!")
        print("="*70)
        print(f"Database: {DB_PATH}")
        print("="*70)
        
        return True
        
    except Exception as e:
        print("\n" + "="*70)
        print(f"ERROR: Failed to process study '{study_name}'")
        print("="*70)
        print(f"Error: {str(e)}")
        print("="*70)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Get study name from command line argument
    if len(sys.argv) < 2:
        print("Usage: python process_single_study.py <study_name>")
        print("Example: python process_single_study.py 'Study 1'")
        sys.exit(1)
    
    study_name = sys.argv[1]
    
    start_time = time.time()
    success = process_single_study(study_name)
    end_time = time.time()
    
    print(f"\nTotal processing time: {end_time - start_time:.2f} seconds")
    
    sys.exit(0 if success else 1)
