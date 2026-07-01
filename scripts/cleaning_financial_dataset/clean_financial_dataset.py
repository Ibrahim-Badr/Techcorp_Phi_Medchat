import json
import hashlib

def clean(records):
    seen = set()
    cleaned = []
    for r in records:
        user = r.get("user", "").strip()
        assistant = r.get("assistant", "").strip()
        if not user or not assistant:
            continue
        h = hashlib.md5((user + assistant).encode()).hexdigest()
        if h in seen:
            continue
        seen.add(h)
        cleaned.append({"system": r.get("system", ""), "user": user, "assistant": assistant})
    return cleaned

train = json.load(open("datasets/finance_dataset_final.json", encoding="utf-8"))
test = json.load(open("datasets/test_dataset_16000.json", encoding="utf-8"))

train_clean = clean(train)
test_clean = clean(test)

json.dump(train_clean, open("datasets/finance_dataset_final.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(test_clean, open("datasets/test_dataset_16000.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"Train: {len(train)} -> {len(train_clean)}")
print(f"Test: {len(test)} -> {len(test_clean)}")