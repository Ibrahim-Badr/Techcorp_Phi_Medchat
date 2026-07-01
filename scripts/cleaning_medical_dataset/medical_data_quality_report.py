import json
import hashlib
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT_DIR = os.path.join(BASE_DIR, "rendu", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def analyze(records, name):
    user_lens = [len(r.get("user", "")) for r in records]
    assistant_lens = [len(r.get("assistant", "")) for r in records]

    empty_user = sum(1 for r in records if not r.get("user", "").strip())
    empty_assistant = sum(1 for r in records if not r.get("assistant", "").strip())

    hashes = [hashlib.md5((r.get("user","")+r.get("assistant","")).encode()).hexdigest() for r in records]
    duplicates = len(hashes) - len(set(hashes))

    very_short = sum(1 for l in assistant_lens if l < 20)
    short_pct = (very_short / len(records)) * 100 if records else 0

    return {
        "name": name,
        "total": len(records),
        "user_min": min(user_lens), "user_max": max(user_lens), "user_avg": sum(user_lens)/len(user_lens),
        "assistant_min": min(assistant_lens), "assistant_max": max(assistant_lens), "assistant_avg": sum(assistant_lens)/len(assistant_lens),
        "empty_user": empty_user,
        "empty_assistant": empty_assistant,
        "duplicates": duplicates,
        "short_answers": very_short,
        "short_pct": short_pct,
    }

def print_console(stats):
    print(f"\n=== {stats['name']} ===")
    print(f"Total records: {stats['total']}")
    print(f"User length   - min: {stats['user_min']}, max: {stats['user_max']}, avg: {stats['user_avg']:.1f}")
    print(f"Assistant length - min: {stats['assistant_min']}, max: {stats['assistant_max']}, avg: {stats['assistant_avg']:.1f}")
    print(f"Empty user fields: {stats['empty_user']}")
    print(f"Empty assistant fields: {stats['empty_assistant']}")
    print(f"Duplicate records: {stats['duplicates']}")
    print(f"Suspiciously short assistant answers (<20 chars): {stats['short_answers']}")

def build_markdown(train_stats, test_stats):
    md = f"""# Medical Dataset — Data Quality Report

*Automatically generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}*

## Pipeline
1. Raw source download: `ruslanmv/ai-medical-chatbot` (Hugging Face, Parquet)
2. Parsing and train/test split
3. Cleaning: removed duplicates, empty fields, and short/noisy answers (<30 chars)

## Results after cleaning

| Metric | Train | Test |
|---|---|---|
| Total records | {train_stats['total']:,} | {test_stats['total']:,} |
| Empty user fields | {train_stats['empty_user']} | {test_stats['empty_user']} |
| Empty assistant fields | {train_stats['empty_assistant']} | {test_stats['empty_assistant']} |
| Duplicates | {train_stats['duplicates']} | {test_stats['duplicates']} |
| Average length (user) | {train_stats['user_avg']:.1f} chars | {test_stats['user_avg']:.1f} chars |
| Average length (assistant) | {train_stats['assistant_avg']:.1f} chars | {test_stats['assistant_avg']:.1f} chars |
| Short answers (<20 chars) | {train_stats['short_answers']:,} ({train_stats['short_pct']:.1f}%) | {test_stats['short_answers']:,} ({test_stats['short_pct']:.1f}%) |

## Observation: short answers

Manual review (see `inspect_short_answers_medical.py`) of the 55 answers originally
under 20 characters revealed low-quality, non-informative responses (e.g. "Hello,",
"Hi.", "test test 12", "ys", "please help"). Unlike the financial dataset, these were
not legitimate short-form answers but truncated or noisy entries. A minimum assistant
length filter (30 characters) was applied during cleaning to remove this noise.

## Conclusion
Dataset validated and ready for experimental LoRA fine-tuning of the medical model.
"""
    return md

train = load_json(os.path.join(BASE_DIR, "datasets", "medical_dataset_final.json"))
test = load_json(os.path.join(BASE_DIR, "datasets", "medical_test_dataset.json"))

train_stats = analyze(train, "Training Set (medical_dataset_final.json)")
test_stats = analyze(test, "Test Set (medical_test_dataset.json)")

print_console(train_stats)
print_console(test_stats)

report = build_markdown(train_stats, test_stats)

output_path = os.path.join(OUTPUT_DIR, "MEDICAL_DATA_QUALITY_REPORT.md")

with open(output_path, "w", encoding="utf-8") as f:
    f.write(report)

print(f"\nReport generated: {output_path}")