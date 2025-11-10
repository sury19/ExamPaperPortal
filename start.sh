#!/usr/bin/env bash
set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start Node email-service on internal port 4000
echo "Starting Nodemailer email-service on port 4000..."
if [ -d "email-service" ]; then
    cd email-service
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing email service dependencies..."
        npm ci
    fi
    # Start email service in background
    PORT=4000 node server.js > email_service.log 2>&1 &
    EMAIL_SERVICE_PID=$!
    cd ..
    echo "Email service started (PID: $EMAIL_SERVICE_PID)"
    
    # Export URL for backend to call the local email service
    export EMAIL_SERVICE_URL="http://localhost:4000"
    echo "EMAIL_SERVICE_URL set to: $EMAIL_SERVICE_URL"
else
    echo "Warning: email-service directory not found. Skipping email service startup."
    export EMAIL_SERVICE_URL=""
fi

# Wait a moment for email service to start
sleep 2

# Start FastAPI backend on Render's provided PORT (default 10000 locally)
BACKEND_PORT="${PORT:-10000}"
echo "Starting FastAPI backend on port ${BACKEND_PORT}..."

# Ensure background process is cleaned up on exit
trap "echo 'Shutting down...'; kill ${EMAIL_SERVICE_PID} 2>/dev/null || true; exit" EXIT INT TERM

# Start uvicorn (this will block until the server stops)
exec uvicorn main:app --host 0.0.0.0 --port "${BACKEND_PORT}"

