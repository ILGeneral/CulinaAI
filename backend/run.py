#!/usr/bin/env python3
"""
Simple script to run the Kaggle API backend server
"""
import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
