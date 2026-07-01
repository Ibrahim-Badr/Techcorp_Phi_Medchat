import pandas as pd

df = pd.read_parquet("datasets/medical_dataset_raw/dialogues.parquet")
print(f"Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nDtypes:\n{df.dtypes}")
print(f"\nSample rows:\n{df.head(3).to_string()}")
print(f"\nNull counts:\n{df.isnull().sum()}")