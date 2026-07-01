from huggingface_hub import snapshot_download

path = snapshot_download(
    repo_id="ruslanmv/ai-medical-chatbot",
    repo_type="dataset",
    local_dir="datasets/medical_dataset_raw"
)
print(path)