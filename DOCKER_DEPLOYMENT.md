# Docker Deployment Guide - Paper Portal

This guide explains how to deploy Paper Portal using Docker and Docker Compose with proper database volume management.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      Docker Compose Environment         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐                  │
│  │  PostgreSQL 15   │                  │
│  │  Container       │                  │
│  │  (postgres)      │──┐               │
│  └──────────────────┘  │               │
│         ↑              │               │
│  postgres_data Volume  │               │
│  (Persistent Storage)  │               │
│                        │               │
│  ┌──────────────────┐  │               │
│  │  FastAPI Backend │◄─┘               │
│  │  Container       │                  │
│  │  (backend)       │                  │
│  └──────────────────┘                  │
│         ↑                              │
│    ./uploads Volume                    │
│    (Paper Files)                       │
│                                         │
│  ┌──────────────────┐                  │
│  │  Adminer         │ (Optional)       │
│  │  Database Admin  │                  │
│  └──────────────────┘                  │
│                                         │
└─────────────────────────────────────────┘
```

## Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Gmail account** (for OTP emails)

## Quick Start (Docker Compose)

### Step 1: Configuration

1. Copy the environment template:
```bash
cp .env.docker .env
```

2. Edit `.env` with your settings:
```env
# Database (use 'postgres' for Docker hostname)
DATABASE_URL=postgresql://postgres:secure123@postgres:5432/exam_paper_portal

# Gmail credentials (for OTP emails)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx  # App password, not regular password

# Security
SECRET_KEY=your-very-long-random-secret-key-here
```

### Step 2: Start Services

```bash
# Navigate to project directory
cd /home/sury/proj/CouncilProjects/examsystem

# Start all services (PostgreSQL, FastAPI, Adminer)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### Step 3: Verify Setup

```bash
# Test API
curl http://localhost:8000/

# API Documentation
http://localhost:8000/docs

# Database Admin (Adminer)
http://localhost:8080
# Login: postgres / secure123
```

## Volume Management

### Understanding Volumes

**Volumes** persist data between container restarts:

#### 1. **Database Volume: `postgres_data`**
```yaml
volumes:
  postgres_data:
    driver: local
```

- **Purpose**: Stores PostgreSQL data files
- **Location**: Docker manages the actual storage path
- **Persistence**: Data survives container restart/removal
- **Access**: Direct database access via connection string

```bash
# View volume details
docker volume inspect exam_portal_db_postgres_data

# Backup volume
docker run --rm -v exam_portal_db_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# List all volumes
docker volume ls
```

#### 2. **Uploads Volume: `./uploads`**
```yaml
volumes:
  - ./uploads:/app/uploads
```

- **Purpose**: Stores uploaded paper files
- **Location**: `./uploads` directory on your host machine
- **Persistence**: Files stay on disk even if container stops
- **Access**: Directly accessible from host machine

```bash
# View uploaded files
ls -la uploads/

# Backup uploads
tar czf uploads_backup.tar.gz uploads/
```

## Database Connection in Docker

### Environment Variables

The database connection works differently in Docker:

#### **For Docker Compose** (Service-to-Service):
```env
# Use the service name as hostname
DATABASE_URL=postgresql://postgres:secure123@postgres:5432/exam_paper_portal
                                           ^^^^^^^^
                                    Service name in docker-compose.yml
```

#### **For Local Development**:
```env
# Use localhost
DATABASE_URL=postgresql://postgres:secure123@localhost:5432/exam_paper_portal
                                           ^^^^^^^^^
```

### Connection Flow

```
FastAPI Container
       ↓
DATABASE_URL: postgresql://postgres:secure123@postgres:5432/...
       ↓
Docker DNS Resolution: "postgres" → 172.xx.0.2 (PostgreSQL container IP)
       ↓
PostgreSQL Container (port 5432)
       ↓
postgres_data Volume
```

## Common Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services (data persists)
docker-compose down

# Restart a service
docker-compose restart backend
docker-compose restart postgres

# View logs
docker-compose logs backend          # Last 100 lines
docker-compose logs -f backend       # Follow logs
docker-compose logs -f --tail=50 postgres  # Last 50 lines

# Execute command in container
docker-compose exec backend python -c "from main import Base, engine; Base.metadata.create_all(bind=engine)"

# Remove everything (including containers but NOT volumes)
docker-compose down

# Remove everything including volumes (⚠ DATA LOSS!)
docker-compose down -v
```

### Database Operations

```bash
# Connect to PostgreSQL directly
docker exec -it exam_portal_db psql -U postgres -d exam_paper_portal

# Backup database
docker exec exam_portal_db pg_dump -U postgres exam_paper_portal > backup.sql

# Restore database
docker exec -i exam_portal_db psql -U postgres exam_paper_portal < backup.sql

# Create admin user
docker exec -it exam_portal_db psql -U postgres -d exam_paper_portal -c \
  "INSERT INTO users (email, name, password_hash, is_admin, email_verified, created_at) \
   VALUES ('admin@example.com', 'Admin', '\$2b\$12\$...', true, true, now());"
```

### Volume Operations

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect exam_portal_db_postgres_data

# Remove unused volumes
docker volume prune

# Backup entire database volume
docker run --rm -v exam_portal_db_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db_backup_$(date +%Y%m%d).tar.gz -C /data .

# Restore from backup
docker run --rm -v exam_portal_db_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/db_backup_20251102.tar.gz -C /data
```

## Troubleshooting

### Issue 1: "Database connection refused"

**Cause**: PostgreSQL container not fully started

**Solution**:
```bash
# Check PostgreSQL health
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Wait and retry
sleep 10
docker-compose restart backend
```

### Issue 2: "address already in use"

**Cause**: Port 5432 or 8000 already in use

**Solution**:
```bash
# Find process using port
lsof -i :5432
lsof -i :8000

# Kill process or use different port
# Edit docker-compose.yml:
# postgres:
#   ports:
#     - "5433:5432"  # Change to different port
```

### Issue 3: "Volume permission denied"

**Cause**: File permission issues

**Solution**:
```bash
# Fix permissions
sudo chown -R $(whoami):$(whoami) uploads/

# Or run with correct user in Dockerfile
```

### Issue 4: "OTP email not working"

**Cause**: Gmail credentials not set

**Solution**:
```bash
# Check env vars in container
docker exec exam_portal_backend env | grep GMAIL

# Verify .env file
cat .env | grep GMAIL

# Test email sending
docker exec -it exam_portal_backend python -c \
  "from main import send_otp_email; send_otp_email('test@example.com', '123456')"
```

## Production Deployment

For production on cloud platforms:

### AWS Deployment (ECS/Fargate)

```bash
# Build and push image to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag exam_portal:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/exam_portal:latest

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/exam_portal:latest
```

### DigitalOcean App Platform

```bash
# Create app.yaml
cat > app.yaml << 'EOF'
name: exam-portal
services:
- name: backend
  image:
    registry: docker.io
    repository: your-username/exam_portal
    tag: latest
  envs:
  - key: DATABASE_URL
    value: ${db.connection_string}
  - key: GMAIL_USER
    value: ${GMAIL_USER}
  - key: GMAIL_PASS
    value: ${GMAIL_PASS}
databases:
- engine: PG
  name: db
  version: "15"
EOF

doctl apps create --spec app.yaml
```

### Using Managed PostgreSQL

Instead of running PostgreSQL in Docker, use managed services:

```env
# DigitalOcean PostgreSQL
DATABASE_URL=postgresql://user:pass@db-postgresql-nyc1-xxxxx.ondigitalocean.com:25060/paper_portal?sslmode=require

# AWS RDS PostgreSQL
DATABASE_URL=postgresql://admin:password@exam-portal-db.c9akciq32.us-east-1.rds.amazonaws.com:5432/exam_portal?sslmode=require

# Railway PostgreSQL
DATABASE_URL=postgresql://user:pass@containers.railway.app:6387/railway?sslmode=require
```

## Backup & Restore Strategy

### Daily Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database backup
docker exec exam_portal_db pg_dump -U postgres exam_paper_portal | \
  gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Uploads backup
tar czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" uploads/

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

## Health Checks

Docker Compose includes health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Monitor health:
```bash
docker-compose ps  # Shows health status
docker-compose logs backend  # View detailed logs
```

## Summary

| Component | Storage Type | Persistence | Access |
|-----------|--------------|-------------|--------|
| Database | Docker Volume | ✅ Persistent | Via connection string |
| Uploads | Host Mount | ✅ Persistent | Via host filesystem |
| App Code | Host Mount | ✅ Persistent | Via host filesystem |
| Temp Data | Container Filesystem | ❌ Lost on restart | Inside container only |

**Key Point**: Always use volumes for data that must persist between container restarts!

---

**Need Help?** Check logs: `docker-compose logs -f`
