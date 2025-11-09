#!/bin/bash
# Railway start script
# This script ensures the uploads directory exists before starting the server

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the FastAPI application
# Render requires binding to 0.0.0.0 and using PORT environment variable
uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}

