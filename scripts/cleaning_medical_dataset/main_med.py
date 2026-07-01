import json
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

def dataset_stats(data, label):
    total = len(data)
    duplicates = total - len(set(json.dumps(d, sort_keys=True) for d in data))
    empty = sum(1 for d in data if not str(d).strip())
    print(f"{label}: total={total}, doublons={duplicates}, vides={empty}")