from huggingface_hub import snapshot_download

path = snapshot_download(
    repo_id="Dipl0/financial_dataset.json",
    repo_type="dataset",
    local_dir="datasets/financial_dataset_raw"
)
print(path)