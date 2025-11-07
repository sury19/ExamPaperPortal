# Railway Deployment Guide for Paper Portal Backend

## Prerequisites
1. A Railway account (sign up at https://railway.app)
2. GitHub account (for connecting your repository)

## Step-by-Step Deployment

### 1. Prepare Your Repository
- Ensure all files are committed and pushed to GitHub
- Make sure `requirements.txt` is up to date
- The `railway.json` or `railway.toml` file is already configured

### 2. Create a New Project on Railway
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `ExamSystemBackend` directory as the root

### 3. Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the connection URL (it will be available as `DATABASE_URL` environment variable)

### 4. Configure Environment Variables
Go to your service → Variables tab and add:

#### Required Variables:
```
DATABASE_URL=<Railway PostgreSQL URL> (automatically set by Railway)
SECRET_KEY=<Generate a strong random secret key>
PORT=8000 (automatically set by Railway)
```

#### Email Configuration (Choose one):

**Option A: Using Resend (Recommended)**
```
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=<your-verified-email@yourdomain.com>
```

**Option B: Using Gmail SMTP**
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
GMAIL_USER=<your-email@gmail.com>
GMAIL_PASS=<your-app-password>
```

### 5. Generate Secret Key
You can generate a secure secret key using Python:
```python
import secrets
print(secrets.token_urlsafe(32))
```

Or use an online generator: https://generate-secret.vercel.app/32

### 6. Deploy
1. Railway will automatically detect the Python project
2. It will install dependencies from `requirements.txt`
3. It will run the start command from `railway.json`
4. Wait for deployment to complete

### 7. Get Your Backend URL
1. Once deployed, Railway will provide a public URL
2. It will look like: `https://your-app-name.up.railway.app`
3. Copy this URL

### 8. Update Frontend Configuration
Update your frontend `.env` file or environment variables:
```
VITE_API_URL=https://your-app-name.up.railway.app
VITE_BACKEND_URL=https://your-app-name.up.railway.app
```

### 9. Test Your Deployment
1. Visit `https://your-app-name.up.railway.app/docs` to see the API documentation
2. Test the health endpoint: `https://your-app-name.up.railway.app/`

## Important Notes

### Database Migrations
If you need to run database migrations or create tables:
1. Use Railway's CLI: `railway run python`
2. Or connect via Railway's database dashboard
3. Run your SQL commands there

### File Uploads
- The `uploads/` directory will be created automatically
- Files uploaded to Railway are **ephemeral** - they will be lost on redeploy
- For production, consider using:
  - Railway Volume (persistent storage)
  - AWS S3
  - Cloudinary
  - Other cloud storage services

### CORS Configuration
Make sure your `main.py` CORS settings allow your frontend domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Monitoring
- Railway provides logs in the dashboard
- Check logs if deployment fails
- Monitor resource usage (CPU, Memory)

## Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Ensure `requirements.txt` has all dependencies
- Verify Python version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check if PostgreSQL service is running
- Ensure database credentials are correct

### Application Crashes
- Check logs in Railway dashboard
- Verify all environment variables are set
- Check if port is correctly configured

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file permissions
- Consider using persistent storage

## Railway CLI (Optional)
Install Railway CLI for easier management:
```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

## Cost Considerations
- Railway offers a free tier with $5 credit/month
- PostgreSQL database is included
- Monitor usage in Railway dashboard
- Upgrade plan if needed for production

## Next Steps
1. Set up custom domain (optional)
2. Configure SSL (automatic with Railway)
3. Set up monitoring and alerts
4. Configure backups for database
5. Set up CI/CD for automatic deployments

