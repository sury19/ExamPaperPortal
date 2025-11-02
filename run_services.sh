#!/bin/bash

# Paper Portal - Simplified Startup Script
# This script helps start the Paper Portal services without Celery/Redis

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    exit 1
fi

print_status "Paper Portal - Simple Startup Script"
print_status "====================================\n"

# Check prerequisites
print_status "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 not found. Please install Python 3.9+"
    exit 1
fi
print_success "Python3 found"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Database may still be running."
else
    print_success "PostgreSQL client found"
fi

print_status "\nActivating virtual environment..."
if [ ! -d "exams" ]; then
    print_error "Virtual environment 'exams' not found!"
    print_status "Creating virtual environment..."
    python3 -m venv exams
fi

source exams/bin/activate
print_success "Virtual environment activated\n"

# Install dependencies
print_status "Checking and installing dependencies..."
pip install -q -r requirements.txt
print_success "Dependencies installed\n"

# Menu for starting services
print_status "How would you like to proceed?\n"
echo "1. Start FastAPI Server (RECOMMENDED for development)"
echo "2. Start Frontend Dev Server"
echo "3. View quick start guide"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "\nStarting FastAPI Server...\n"
        print_status "Server will run on http://localhost:8000"
        print_status "API Docs: http://localhost:8000/docs\n"
        sleep 1
        uvicorn main:app --reload --port 8000
        ;;
    2)
        print_status "\nStarting Frontend Dev Server...\n"
        cd frontend
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        fi
        npm run dev
        ;;
    3)
        print_status "\nQuick Start Guide"
        print_status "=================\n"
        
        echo "1. REQUIREMENTS"
        echo "   - Python 3.9+"
        echo "   - PostgreSQL running"
        echo "   - Node.js & npm (for frontend)"
        echo ""
        echo "2. SETUP .env FILE"
        echo "   Edit .env with your Gmail credentials:"
        echo "   - GMAIL_USER: your-email@gmail.com"
        echo "   - GMAIL_PASS: your-app-password (16-char app password, not regular password)"
        echo ""
        echo "3. START BACKEND"
        echo "   source exams/bin/activate"
        echo "   uvicorn main:app --reload --port 8000"
        echo ""
        echo "4. START FRONTEND (in another terminal)"
        echo "   cd frontend"
        echo "   npm run dev"
        echo ""
        echo "5. ACCESS APPLICATION"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend API: http://localhost:8000"
        echo "   API Docs: http://localhost:8000/docs"
        echo ""
        echo "6. TESTING OTP"
        echo "   - Student enters email"
        echo "   - Check FastAPI console for OTP code"
        echo "   - Enter OTP in app to login"
        echo ""
        echo "ADMIN USER:"
        echo "   - Go to /admin-login"
        echo "   - Create first admin via database or API"
        echo ""
        echo "FOR ACTUAL EMAIL SENDING:"
        echo "   - Enable Gmail 2-Factor Authentication"
        echo "   - Generate App Password: https://myaccount.google.com/apppasswords"
        echo "   - Use the 16-character password in GMAIL_PASS"
        echo ""
        
        read -p "Press Enter to continue..."
        ;;
    4)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac

print_success "\nSetup complete!"
