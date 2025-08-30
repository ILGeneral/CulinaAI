#!/usr/bin/env python3
"""
Simple test script to verify the FastAPI server works without Kaggle authentication
"""
import requests
import time

def test_server():
    print("Testing FastAPI server...")
    
    # Start the server in a separate process (you'll need to run main.py manually first)
    print("Please run 'python main.py' in a separate terminal first")
    print("Then press Enter to test the server...")
    input()
    
    try:
        # Test the root endpoint
        response = requests.get("http://localhost:8000/")
        print(f"Root endpoint response: {response.status_code}")
        print(f"Response content: {response.json()}")
        
        # Test the datasets endpoint (this will fail without kaggle.json but should return proper error)
        response = requests.get("http://localhost:8000/api/datasets")
        print(f"Datasets endpoint response: {response.status_code}")
        print(f"Response content: {response.json()}")
        
    except requests.exceptions.ConnectionError:
        print("Server is not running. Please start it with 'python main.py'")
    except Exception as e:
        print(f"Error testing server: {e}")

if __name__ == "__main__":
    test_server()
