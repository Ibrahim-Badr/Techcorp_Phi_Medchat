import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

steps = [
    "scripts/cleaning_medical_dataset/download_medical_dataset.py",
    "scripts/cleaning_medical_dataset/inspect_medical_dataset.py",
    "scripts/cleaning_medical_dataset/prepare_medical_dataset.py",
    "scripts/cleaning_medical_dataset/clean_medical_dataset.py",
    "scripts/cleaning_medical_dataset/medical_data_quality_report.py",
]

for step in steps:
    print(f"\n{'='*50}\nRunning: {step}\n{'='*50}")
    result = subprocess.run([sys.executable, step], cwd=BASE_DIR)
    if result.returncode != 0:
        print(f"Step failed: {step}")
        sys.exit(1)

print("\nMedical dataset pipeline completed successfully.")