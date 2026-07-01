import json

train = json.load(open("datasets/finance_dataset_final.json", encoding="utf-8"))

short = [r for r in train if len(r.get("assistant", "")) < 20]
print(f"Total short answers: {len(short)}\n")

for r in short[:20]:
    print(f"USER: {r['user'][:80]}")
    print(f"ASSISTANT: {repr(r['assistant'])}")
    print("---")