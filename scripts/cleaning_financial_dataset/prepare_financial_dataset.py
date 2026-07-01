import json
import random

random.seed(42)

input_path = "datasets/financial_dataset_raw/dataset_v0.json"
final_path = "datasets/finance_dataset_final.json"
test_path = "datasets/test_dataset_16000.json"

records = []
with open(input_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            if obj.get("user") and obj.get("assistant"):
                records.append(obj)
        except json.JSONDecodeError:
            continue

print(f"Total valid records: {len(records)}")

random.shuffle(records)
test_size = 16000
test_set = records[:test_size]
train_set = records[test_size:]

with open(test_path, "w", encoding="utf-8") as f:
    json.dump(test_set, f, ensure_ascii=False, indent=2)

with open(final_path, "w", encoding="utf-8") as f:
    json.dump(train_set, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(train_set)} records to {final_path}")
print(f"Wrote {len(test_set)} records to {test_path}")