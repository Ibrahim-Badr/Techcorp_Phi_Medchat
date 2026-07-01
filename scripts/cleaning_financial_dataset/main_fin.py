import subprocess
import sys
import os
import json


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

steps = [
    "scripts/cleaning_financial_dataset/download_financial_dataset.py",
    "scripts/cleaning_financial_dataset/prepare_financial_dataset.py",
    "scripts/cleaning_financial_dataset/clean_financial_dataset.py",
    "scripts/cleaning_financial_dataset/financial_data_quality_report.py",
]

for step in steps:
    print(f"\n{'='*50}\nRunning: {step}\n{'='*50}")
    result = subprocess.run([sys.executable, step], cwd=BASE_DIR)
    if result.returncode != 0:
        print(f"Step failed: {step}")
        sys.exit(1)

print("\nFinancial dataset pipeline completed successfully.")

def dataset_stats(data, label):
    total = len(data)
    duplicates = total - len(set(json.dumps(d, sort_keys=True) for d in data))
    empty = sum(1 for d in data if not str(d).strip())
    print(f"{label}: total={total}, doublons={duplicates}, vides={empty}")