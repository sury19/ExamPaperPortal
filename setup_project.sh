#!/bin/bash

# Paper Portal Setup Script
# This script sets up the Paper Portal project by installing dependencies and initializing the database

set -e  # Exit on any error

echo "========================================"
echo "  PAPER PORTAL - SETUP SCRIPT"
echo "========================================"
echo

# Check if Python 3.9+ is installed
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.9 or higher."
    echo "   Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "   macOS: brew install python3"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.9"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python $PYTHON_VERSION found, but Python $REQUIRED_VERSION+ is required."
    exit 1
fi

echo "✅ Python $PYTHON_VERSION found"
echo

# Check if PostgreSQL is installed
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
    echo "   Then start: sudo service postgresql start"
    exit 1
fi

echo "✅ PostgreSQL found"
echo

# Activate virtual environment
echo "Activating virtual environment..."
if [ ! -d "exams" ]; then
    echo "❌ Virtual environment 'exams' not found in current directory."
    exit 1
fi

source exams/bin/activate
echo "✅ Virtual environment activated"
echo

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic passlib[bcrypt] python-jose[cryptography] python-multipart

echo "✅ Dependencies installed"
echo

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads
echo "✅ Uploads directory created"
echo

# Database setup instructions
echo "========================================"
echo "DATABASE SETUP REQUIRED"
echo "========================================"
echo
echo "1. Make sure PostgreSQL is running:"
echo "   sudo service postgresql start  # Linux"
echo "   brew services start postgresql  # macOS"
echo
echo "2. Create the database:"
echo "   sudo -u postgres createdb paper_portal"
echo "   OR:"
echo "   createdb paper_portal  # if you have permissions"
echo
echo "3. Update database connection in main.py if needed:"
echo "   Change DATABASE_URL to match your PostgreSQL credentials"
echo
echo "4. Initialize the database:"
echo "   python setup.py"
echo
echo "5. Start the server:"
echo "   uvicorn main:app --reload"
echo
echo "========================================"
echo "ADMIN CREDENTIALS (after setup):"
echo "Email: admin@university.edu"
echo "Password: admin123"
echo "========================================"
echo
echo "Setup script completed successfully!"
echo "Follow the database setup steps above to complete the installation."