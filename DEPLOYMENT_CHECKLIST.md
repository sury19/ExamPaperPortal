# 🚀 Deployment Checklist - Paper Portal

## Pre-Deployment ✅

### 1. Code & Dependencies
- [ ] All code committed to git
- [ ] Run tests locally: `pytest tests/`
- [ ] Update requirements.txt: `pip freeze > requirements.txt`
- [ ] Verify Dockerfile builds: `docker build -t exam_portal .`
- [ ] No hardcoded secrets in code
- [ ] No debugging prints left in code
- [ ] Environment variables documented

### 2. Configuration Files
- [ ] Created `.env.production` with production values
- [ ] `.env.production` is in `.gitignore`
- [ ] `docker-compose.yml` uses production settings
- [ ] All environment variables documented

### 3. Database
- [ ] PostgreSQL version compatible (15+)
- [ ] Database user password is strong
- [ ] Database backup strategy planned
- [ ] Database restore process tested
- [ ] Migrations script created (if needed)
- [ ] Initial admin user creation documented

### 4. Email Setup
- [ ] Gmail account has 2-Factor Authentication
- [ ] App Password generated and saved securely
- [ ] Email template tested locally
- [ ] Fallback error handling in place

### 5. Security
- [ ] SECRET_KEY is random and strong (min 32 chars)
- [ ] No credentials in version control
- [ ] HTTPS/SSL configured (if applicable)
- [ ] CORS settings verified
- [ ] Rate limiting implemented (consider for /send-otp)
- [ ] SQL injection protection verified
- [ ] File upload validation in place

### 6. Docker Setup
- [ ] Dockerfile optimized (multi-stage if large)
- [ ] docker-compose.yml configured
- [ ] All volumes defined for data persistence
- [ ] Health checks configured
- [ ] Image built and tested
- [ ] Image pushed to registry (if using)

---

## Deployment 🚀

### 1. For Docker Compose (Local/VPS)

```bash
# Step 1: Clone repository
git clone https://github.com/suryaansh001/ExamSystemBackend.git
cd examsystem

# Step 2: Setup environment
cp .env.production .env
# Edit .env with production values
nano .env

# Step 3: Build and start
docker-compose build
docker-compose up -d

# Step 4: Verify
docker-compose ps
docker-compose logs backend

# Step 5: Test
curl http://localhost:8000/
```

### 2. For Cloud Platforms

#### AWS Elastic Container Service (ECS)

```bash
# Push image to ECR
aws ecr create-repository --repository-name exam-portal
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag exam_portal:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/exam-portal:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/exam-portal:latest

# Create ECS task definition with environment variables
# Set RDS database endpoint in DATABASE_URL
# Create ECS service
```

#### DigitalOcean App Platform

```bash
# Deploy from Docker image
doctl apps create --spec app.yaml

# Or deploy from GitHub
# 1. Connect GitHub repository
# 2. Select main branch
# 3. Set environment variables
# 4. Deploy
```

#### Railway.app

```bash
# Deploy via GitHub integration
# 1. Connect GitHub repo at railway.app
# 2. Auto-detects Dockerfile
# 3. Set environment variables in dashboard
# 4. Deploy automatically
```

---

## Post-Deployment ✅

### 1. Verification
- [ ] All services running: `docker-compose ps`
- [ ] Database accessible: `curl http://localhost:8000/me` (should fail, expected)
- [ ] API docs working: `curl http://localhost:8000/docs`
- [ ] Health check passing

### 2. Testing
- [ ] Test OTP endpoint: 
  ```bash
  curl -X POST http://localhost:8000/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  ```
- [ ] Test file upload
- [ ] Test paper download
- [ ] Test admin functions
- [ ] Monitor logs for errors: `docker-compose logs -f`

### 3. Monitoring
- [ ] Setup log aggregation (CloudWatch, Papertrail)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Setup error tracking (Sentry)
- [ ] Monitor resource usage (CPU, Memory, Disk)

### 4. Backups
- [ ] Test database backup
- [ ] Test database restore
- [ ] Setup automatic backups
- [ ] Store backups securely

### 5. Security Review
- [ ] HTTPS working (if applicable)
- [ ] Headers configured (HSTS, CSP)
- [ ] Rate limiting working
- [ ] SQL injection tests passed
- [ ] XSS protection verified

---

## Rollback Plan 🔙

If deployment fails:

```bash
# Option 1: Revert to previous container
docker-compose down
git checkout previous_commit
docker-compose up -d

# Option 2: Restore database backup
docker exec exam_portal_db psql -U postgres exam_paper_portal < backup.sql

# Option 3: Switch to previous image tag
# Edit docker-compose.yml
# Change image: exam_portal:latest to exam_portal:v1.0.0
docker-compose up -d
```

---

## Monitoring & Maintenance 📊

### Daily Checks
- [ ] Application responding (health checks)
- [ ] Database accessible
- [ ] No error spikes in logs
- [ ] Upload directory disk space okay

### Weekly Checks
- [ ] Review logs for patterns
- [ ] Check database size
- [ ] Verify backups completed
- [ ] Test recovery procedure

### Monthly Checks
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Performance analysis
- [ ] Database optimization (VACUUM, ANALYZE)

### Quarterly Checks
- [ ] Security audit
- [ ] Capacity planning
- [ ] Cost analysis
- [ ] Disaster recovery drill

---

## Emergency Procedures 🚨

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check environment variables
docker-compose config

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Check database exists
docker exec exam_portal_db psql -U postgres -l

# Verify environment variable
docker exec exam_portal_backend env | grep DATABASE_URL
```

### Out of Disk Space
```bash
# Check disk usage
docker system df

# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check uploads folder
du -sh uploads/
```

### Application Slow
```bash
# Check resource usage
docker stats

# Check database slow queries
docker exec exam_portal_db psql -U postgres -d exam_paper_portal \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Optimize database
docker exec exam_portal_db psql -U postgres -d exam_paper_portal \
  -c "VACUUM ANALYZE;"
```

---

## Useful Commands 🛠️

```bash
# View logs
docker-compose logs -f backend
docker-compose logs --tail=50 backend

# Execute command in container
docker-compose exec backend python -c "print('test')"

# Access database
docker-compose exec postgres psql -U postgres -d exam_paper_portal

# Backup database
docker-compose exec postgres pg_dump -U postgres exam_paper_portal > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres exam_paper_portal < backup.sql

# Restart service
docker-compose restart backend
docker-compose restart postgres

# Stop all services
docker-compose down

# Remove everything (keep volumes)
docker-compose down

# Remove everything (delete volumes!)
docker-compose down -v

# Get container details
docker inspect exam_portal_backend
```

---

## Deployment Completed ✅

**Deployment Date**: _______________
**Deployed By**: _______________
**Environment**: [Development/Staging/Production]
**Version**: _______________
**Database Backed Up**: [Yes/No]
**Rollback Plan Documented**: [Yes/No]

---

## Troubleshooting Links

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [SQLAlchemy Pooling](https://docs.sqlalchemy.org/en/20/core/pooling.html)
