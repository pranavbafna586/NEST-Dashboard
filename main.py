import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from extract_data import extract_all_data
from fill_missing_values import fill_all_missing_data, populate_site_id_in_esae
from create_database import create_database, verify_database
from data_insertion import insert_all_data, verify_insertion
from dqi_clean_status_cal import calculate_all_dqi_and_clean_status, verify_dqi_clean_status

load_dotenv()

# Configuration
STUDY_FILES_DIR = os.path.join(os.getcwd(), "Study Files")
DB_PATH = os.getcwd() + os.getenv("DB_PATH", "/database/edc_metrics.db")

def get_all_studies():
    """Get list of all study directories from Study Files folder"""
    if not os.path.exists(STUDY_FILES_DIR):
        print(f"Error: Study Files directory not found at {STUDY_FILES_DIR}")
        return []
    
    studies = []
    for item in os.listdir(STUDY_FILES_DIR):
        item_path = os.path.join(STUDY_FILES_DIR, item)
        if os.path.isdir(item_path):
            studies.append(item)
    
    return studies

def process_single_study(study_name):
    """Process a single study: extract, fill, and prepare for insertion"""
    print(f"\nProcessing study: {study_name}")
    
    # Step 1: Extract data
    print("  → Extracting data...")
    dataframes = extract_all_data(project_name=study_name)
    print("  ✓ Data extraction completed")
    
    # Step 2: Populate Site ID in eSAE Dashboard
    print("  → Populating Site ID in eSAE Dashboard...")
    dataframes['SAE Dashboard_DM'], dataframes['SAE Dashboard_Safety'] = populate_site_id_in_esae(
        dataframes['Subject_Level_Metrics'],
        dataframes['SAE Dashboard_DM'],
        dataframes['SAE Dashboard_Safety']
    )
    
    # Step 3: Fill missing values
    print("  → Filling missing values...")
    filled_subject_metrics = fill_all_missing_data(dataframes)
    print("  ✓ Missing values filled")
    
    return dataframes, filled_subject_metrics

def test_single_study(project_name):
    """Test processing of a single study by applying all steps"""
    try:
        print(f"\nTesting study: {project_name}")
        
        # Step 1: Extract data
        print("  → Extracting data...")
        start_time = time.time()
        dataframes = extract_all_data(project_name=project_name)
        end_time = time.time()
        print(f"  ✓ Data extraction completed (Time taken: {end_time - start_time:.2f} seconds)")
        
        # Step 2: Populate Site ID in eSAE Dashboard
        print("  → Populating Site ID in eSAE Dashboard...")
        dataframes['SAE Dashboard_DM'], dataframes['SAE Dashboard_Safety'] = populate_site_id_in_esae(
            dataframes['Subject_Level_Metrics'],
            dataframes['SAE Dashboard_DM'],
            dataframes['SAE Dashboard_Safety']
        )
        
        # Step 3: Fill missing values
        print("  → Filling missing values...")
        filled_subject_metrics = fill_all_missing_data(dataframes)
        print("  ✓ Missing values filled")

        # Create database directory if it doesn't exist
        db_dir = os.path.dirname(DB_PATH)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            print(f"\nCreated database directory: {db_dir}")
        
        # Step 1: Create database schema
        print("\n" + "="*70)
        print("STEP 1: Creating Database Schema")
        print("="*70)
        create_database()
        print("✓ Database schema created successfully")
        
        # Step 4: Verify database schema
        print("  → Verifying database schema...")
        verify_database()
        print("  ✓ Database schema verified")
        
        # Step 5: Insert data into database
        print("  → Inserting data into database...")
        start_time = time.time()
        insert_all_data(dataframes, filled_subject_metrics)
        print("  ✓ Data inserted successfully")
        end_time = time.time()
        print(f"  ✓ Data insertion completed (Time taken: {end_time - start_time:.2f} seconds)")
        
        # Step 6: Verify data insertion
        print("  → Verifying data insertion...")
        verify_insertion()
        print("  ✓ Data insertion verified")
        
        print(f"✓ Test for study '{project_name}' completed successfully")
    except Exception as e:
        print(f"✗ Error testing study '{project_name}': {str(e)}")

def main():
    """Main workflow to process all studies and create consolidated database"""
    print("="*70)
    print("EDC METRICS DATA PROCESSING - CONSOLIDATED WORKFLOW")
    print("="*70)
    
    # Get all studies
    studies = get_all_studies()
    
    if not studies:
        print("No studies found in Study Files directory")
        return
    
    print(f"\nFound {len(studies)} studies to process:")
    for i, study in enumerate(studies, 1):
        print(f"  {i}. {study}")
    
    # Create database directory if it doesn't exist
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"\nCreated database directory: {db_dir}")
    
    # Step 1: Create database schema
    print("\n" + "="*70)
    print("STEP 1: Creating Database Schema")
    print("="*70)
    create_database()
    print("✓ Database schema created successfully")
    
    # Step 2: Process each study
    print("\n" + "="*70)
    print("STEP 2: Processing Studies")
    print("="*70)
    
    all_study_data = []
    
    for study_name in studies:
        try:
            dataframes, filled_subject_metrics = process_single_study(study_name)
            all_study_data.append({
                'study_name': study_name,
                'dataframes': dataframes,
                'filled_subject_metrics': filled_subject_metrics
            })
            print(f"✓ Study '{study_name}' processed successfully")
        except Exception as e:
            print(f"✗ Error processing study '{study_name}': {str(e)}")
            continue
    
    # Step 3: Insert data into database
    print("\n" + "="*70)
    print("STEP 3: Inserting Data into Database")
    print("="*70)
    
    total_inserted = 0
    for study_data in all_study_data:
        study_name = study_data['study_name']
        print(f"\nInserting data for study: {study_name}")
        try:
            insert_all_data(study_data['dataframes'], study_data['filled_subject_metrics'])
            total_inserted += 1
            print(f"✓ Study '{study_name}' data inserted successfully")
        except Exception as e:
            print(f"✗ Error inserting data for study '{study_name}': {str(e)}")
            continue
    
    # Step 4: Verify database
    print("\n" + "="*70)
    print("STEP 4: Database Verification")
    print("="*70)
    verify_insertion()
    
    # Step 5: Calculate DQI and Clean Status
    print("\n" + "="*70)
    print("STEP 5: Calculating DQI and Clean Status")
    print("="*70)
    calculate_all_dqi_and_clean_status()
    
    # Step 6: Verify DQI and Clean Status
    print("\n" + "="*70)
    print("STEP 6: Verifying DQI and Clean Status")
    print("="*70)
    verify_dqi_clean_status()
    
    # Summary
    print("\n" + "="*70)
    print("PROCESSING SUMMARY")
    print("="*70)
    print(f"Total studies found: {len(studies)}")
    print(f"Studies processed successfully: {len(all_study_data)}")
    print(f"Studies inserted into database: {total_inserted}")
    print(f"Database location: {DB_PATH}")
    print("="*70)
    print("\n✓ ALL OPERATIONS COMPLETED SUCCESSFULLY!")
    print("="*70)

if __name__ == "__main__":
    start_time = time.time()
    main()
    end_time = time.time()
    print(f"Completed data extraction and insertion in {end_time - start_time} secs!")

    # test_single_study(project_name="Study 6")
