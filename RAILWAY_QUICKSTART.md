# Railway Quick Start Guide

## 🚀 Quick Deploy to Railway

### 1. One-Click Setup
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to: `ExamSystemBackend`

### 2. Add PostgreSQL Database
- Click "New" → "Database" → "PostgreSQL"
- Railway automatically sets `DATABASE_URL`

### 3. Set Environment Variables
Go to Variables tab and add:

**Required:**
```
SECRET_KEY=<generate-random-key>
```

**Email (choose one):**
```
RESEND_API_KEY=<your-key>
RESEND_FROM_EMAIL=<your-email>
```

OR

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
GMAIL_USER=<your-email>
GMAIL_PASS=<app-password>
```

### 4. Deploy!
Railway will automatically:
- Install dependencies
- Start the server
- Provide a public URL

### 5. Test
Visit: `https://your-app.up.railway.app/docs`

## 📝 Files Created
- `railway.json` - Railway configuration
- `railway.toml` - Alternative configuration
- `Procfile` - Process file for Railway
- `.railwayignore` - Files to exclude from deployment
- `start.sh` - Startup script
- `.env.example` - Environment variables template

## 🔗 Next Steps
1. Update frontend with Railway URL
2. Configure CORS if needed
3. Set up custom domain (optional)
4. Monitor logs in Railway dashboard

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

