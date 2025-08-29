from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import kaggle
import pandas as pd
import os
from dotenv import load_dotenv
import json
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="Kaggle API Backend", version="1.0.0")

# Configure CORS to allow requests from your React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your app's specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Kaggle API
def setup_kaggle():
    """Set up Kaggle API configuration"""
    kaggle_dir = os.path.expanduser('~/.kaggle')
    kaggle_json = os.path.join(kaggle_dir, 'kaggle.json')
    
    if not os.path.exists(kaggle_json):
        raise Exception("Kaggle API credentials not found. Please place kaggle.json in ~/.kaggle/")
    
    # Set appropriate permissions
    os.chmod(kaggle_json, 0o600)
    os.chmod(kaggle_dir, 0o700)

@app.get("/")
async def root():
    return {"message": "Kaggle API Backend is running"}

@app.get("/api/datasets")
async def list_datasets(search: Optional[str] = None, size: int = 10):
    """List datasets from Kaggle with optional search"""
    try:
        setup_kaggle()
        api = kaggle.KaggleApi()
        api.authenticate()
        
        if search:
            datasets = api.dataset_list(search=search, page_size=size)
        else:
            datasets = api.dataset_list(page_size=size)
        
        return {
            "datasets": [
                {
                    "title": dataset.title,
                    "ref": dataset.ref,
                    "size": dataset.size,
                    "lastUpdated": dataset.lastUpdated,
                    "downloadCount": dataset.downloadCount,
                    "voteCount": dataset.voteCount
                }
                for dataset in datasets
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching datasets: {str(e)}")

@app.get("/api/datasets/{dataset_ref}/download")
async def download_dataset(dataset_ref: str):
    """Download a specific dataset"""
    try:
        setup_kaggle()
        api = kaggle.KaggleApi()
        api.authenticate()
        
        # Download dataset
        api.dataset_download_files(dataset_ref, path="./downloads", unzip=True)
        
        # Read the downloaded CSV files
        download_dir = f"./downloads/{dataset_ref.split('/')[-1]}"
        data_files = []
        
        for file in os.listdir(download_dir):
            if file.endswith('.csv'):
                df = pd.read_csv(os.path.join(download_dir, file))
                data_files.append({
                    "filename": file,
                    "columns": df.columns.tolist(),
                    "sample_data": df.head().to_dict('records')
                })
        
        return {
            "dataset_ref": dataset_ref,
            "files": data_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading dataset: {str(e)}")

@app.get("/api/competitions")
async def list_competitions(size: int = 10):
    """List Kaggle competitions"""
    try:
        setup_kaggle()
        api = kaggle.KaggleApi()
        api.authenticate()
        
        competitions = api.competitions_list(page_size=size)
        
        return {
            "competitions": [
                {
                    "title": comp.title,
                    "ref": comp.ref,
                    "category": comp.category,
                    "reward": comp.reward,
                    "teamCount": comp.teamCount,
                    "userHasEntered": comp.userHasEntered
                }
                for comp in competitions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching competitions: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
