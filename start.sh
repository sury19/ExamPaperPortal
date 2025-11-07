#!/bin/bash
# Railway start script
# This script ensures the uploads directory exists before starting the server

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

