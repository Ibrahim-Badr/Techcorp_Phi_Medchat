import pandas as pd
import json
import random

random.seed(42)

input_path = "datasets/medical_dataset_raw/dialogues.parquet"
final_path = "datasets/medical_dataset_final.json"
test_path = "datasets/medical_test_dataset.json"

df = pd.read_parquet(input_path)
print(f"Loaded {len(df)} rows, columns: {df.columns.tolist()}")

col_map = {c.lower(): c for c in df.columns}
patient_col = col_map.get("patient") or col_map.get("user") or col_map.get("description")
doctor_col = col_map.get("doctor") or col_map.get("assistant") or col_map.get("response")

if not patient_col or not doctor_col:
    raise ValueError(f"Could not detect patient/doctor columns. Found: {df.columns.tolist()}")

print(f"Using columns -> user: '{patient_col}', assistant: '{doctor_col}'")

records = []
for _, row in df.iterrows():
    user = str(row[patient_col]).strip() if pd.notna(row[patient_col]) else ""
    assistant = str(row[doctor_col]).strip() if pd.notna(row[doctor_col]) else ""
    if user and assistant:
        records.append({"system": "You are a helpful medical assistant.", "user": user, "assistant": assistant})

print(f"Total valid records: {len(records)}")

random.shuffle(records)
test_size = min(5000, int(len(records) * 0.05))
test_set = records[:test_size]
train_set = records[test_size:]

with open(test_path, "w", encoding="utf-8") as f:
    json.dump(test_set, f, ensure_ascii=False, indent=2)

with open(final_path, "w", encoding="utf-8") as f:
    json.dump(train_set, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(train_set)} records to {final_path}")
print(f"Wrote {len(test_set)} records to {test_path}")