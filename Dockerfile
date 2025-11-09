FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Render will set PORT environment variable)
# Default to 10000 to match Render's typical port
EXPOSE 10000

# Health check (using curl which is available in slim image)
# Use PORT env var or default to 10000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${PORT:-10000}/health || exit 1'

# Run the application
# Render requires binding to 0.0.0.0 and using PORT environment variable
CMD sh -c 'uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}'

