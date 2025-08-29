# Kaggle API Backend

A FastAPI backend service for integrating Kaggle API functionality with your React Native app.

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set up Kaggle API Credentials
1. Go to [Kaggle.com](https://www.kaggle.com/)
2. Click on your profile → Account → API → Create New Token
3. Download the `kaggle.json` file
4. Place it in `~/.kaggle/` directory (create the directory if it doesn't exist)

### 3. Run the Backend Server
```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python main.py
```

### 4. Test the API
The server will be running at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- List datasets: `GET /api/datasets?search=food`
- Download dataset: `GET /api/datasets/{dataset_ref}/download`
- List competitions: `GET /api/competitions`

## API Endpoints

### GET /api/datasets
List datasets with optional search
- Parameters: `search` (optional), `size` (default: 10)

### GET /api/datasets/{dataset_ref}/download
Download and preview a specific dataset

### GET /api/competitions
List Kaggle competitions
- Parameters: `size` (default: 10)

## Integration with React Native

In your React Native app, you can make requests to the backend:

```javascript
// Example: Fetch datasets
const fetchDatasets = async (searchTerm) => {
  try {
    const response = await fetch(`http://localhost:8000/api/datasets?search=${searchTerm}`);
    const data = await response.json();
    return data.datasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
  }
};

// Example: Download dataset
const downloadDataset = async (datasetRef) => {
  try {
    const response = await fetch(`http://localhost:8000/api/datasets/${datasetRef}/download`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error downloading dataset:', error);
  }
};
```

## Production Deployment

For production, consider:
1. Using environment variables for configuration
2. Setting up proper CORS origins
3. Adding authentication/authorization
4. Using a proper web server like Gunicorn
5. Setting up proper error handling and logging
