# Financial Dataset — Data Quality Report

*Automatically generated on 2026-07-01 12:20*

## Pipeline
1. Raw source download: `Dipl0/financial_dataset.json` (Hugging Face, JSONL)
2. Parsing and train/test split
3. Cleaning: removed duplicates and empty fields

## Results after cleaning

| Metric | Train | Test |
|---|---|---|
| Total records | 496,097 | 15,978 |
| Empty user fields | 0 | 0 |
| Empty assistant fields | 0 | 0 |
| Duplicates | 0 | 0 |
| Average length (user) | 514.3 chars | 524.6 chars |
| Average length (assistant) | 392.4 chars | 396.0 chars |
| Short answers (<20 chars) | 146,968 (29.6%) | 4,823 (30.2%) |

## Observation: short answers

Manual review (see `inspect_short_answers_financial.py`) confirms that short answers
correspond to legitimate tasks such as classification, sentiment analysis, and factual
extraction (e.g. "neutral", "Yes", "31", "India"). This is not a quality defect but a
characteristic of the multi-task dataset.

## Conclusion
Dataset validated and ready for LoRA fine-tuning of Phi-3.5-Financial.
