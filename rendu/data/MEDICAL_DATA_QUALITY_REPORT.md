# Medical Dataset — Data Quality Report

*Automatically generated on 2026-07-01 14:37*

## Pipeline
1. Raw source download: `ruslanmv/ai-medical-chatbot` (Hugging Face, Parquet)
2. Parsing and train/test split
3. Cleaning: removed duplicates, empty fields, and short/noisy answers (<30 chars)

## Results after cleaning

| Metric | Train | Test |
|---|---|---|
| Total records | 241,590 | 4,847 |
| Empty user fields | 0 | 0 |
| Empty assistant fields | 0 | 0 |
| Duplicates | 0 | 0 |
| Average length (user) | 439.0 chars | 434.8 chars |
| Average length (assistant) | 528.9 chars | 530.0 chars |
| Short answers (<20 chars) | 0 (0.0%) | 0 (0.0%) |

## Observation: short answers

Manual review (see `inspect_short_answers_medical.py`) of the 55 answers originally
under 20 characters revealed low-quality, non-informative responses (e.g. "Hello,",
"Hi.", "test test 12", "ys", "please help"). Unlike the financial dataset, these were
not legitimate short-form answers but truncated or noisy entries. A minimum assistant
length filter (30 characters) was applied during cleaning to remove this noise.

## Conclusion
Dataset validated and ready for experimental LoRA fine-tuning of the medical model.
