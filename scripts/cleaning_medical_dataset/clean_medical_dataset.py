import json
import hashlib

MIN_ASSISTANT_LEN = 30  # seuil relevé après inspection manuelle des cas <20 chars

def clean(records):
    seen = set()
    cleaned = []
    for r in records:
        user = r.get("user", "").strip()
        assistant = r.get("assistant", "").strip()
        if not user or not assistant:
            continue
        if len(assistant) < MIN_ASSISTANT_LEN:
            continue
        h = hashlib.md5((user + assistant).encode()).hexdigest()
        if h in seen:
            continue
        seen.add(h)
        cleaned.append({"system": r.get("system", ""), "user": user, "assistant": assistant})
    return cleaned

train = json.load(open("datasets/medical_dataset_final.json", encoding="utf-8"))
test = json.load(open("datasets/medical_test_dataset.json", encoding="utf-8"))

train_clean = clean(train)
test_clean = clean(test)

json.dump(train_clean, open("datasets/medical_dataset_final.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(test_clean, open("datasets/medical_test_dataset.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"Train: {len(train)} -> {len(train_clean)}")
print(f"Test: {len(test)} -> {len(test_clean)}")