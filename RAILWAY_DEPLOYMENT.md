# Railway Deployment Guide

## Overview

This guide covers deploying the Army Recruitment Platform and Open Notebook to Railway. Railway will host:
- This application (backend + frontend)
- Open Notebook (backend + database)

## Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI installed: `npm i -g @railway/cli`
3. GitHub repository (for automatic deployments)

## Railway Project Structure

### Recommended Setup

Create a Railway project with multiple services:
1. **Backend Service** - API server
2. **Frontend Service** (optional) - Static frontend, or serve from backend
3. **PostgreSQL** - Railway PostgreSQL plugin
4. **Redis** - Railway Redis plugin (optional)
5. **Open Notebook Service** - Separate service

## Step-by-Step Deployment

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
railway login
```

### 2. Initialize Railway Project

```bash
# From project root
railway init
```

This creates a `railway.json` configuration file.

### 3. Add PostgreSQL Database

In Railway dashboard:
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically provides `DATABASE_URL` environment variable
3. Note the database service name

### 4. Add Redis (Optional)

1. Click "New" → "Database" → "Add Redis"
2. Railway provides `REDIS_URL` automatically

### 5. Configure Backend Service

In Railway dashboard:
1. Create new service from your GitHub repo
2. Set root directory to project root
3. Configure build settings:

**Build Command:**
```bash
npm ci && npm run build --workspace=shared && npm run build --workspace=agents && npm run build --workspace=backend
```

**Start Command:**
```bash
npm run start --workspace=backend
```

**Environment Variables:**
```bash
# Database (auto-provided by Railway)
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}

# Redis (if using)
REDIS_URL=${{Redis.REDIS_URL}}

# Server
PORT=${{PORT}}
NODE_ENV=production

# Authentication
JWT_SECRET=your-secure-random-secret-key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-app.railway.app

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4

# RAG / Open Notebook
OPEN_NOTEBOOK_URL=${{OpenNotebook.RAILWAY_PUBLIC_DOMAIN}}
RAG_ENABLED=true

# API
API_URL=https://your-backend.railway.app
```

### 6. Configure Frontend Service (Optional)

**Option A: Serve from Backend (Recommended)**

Add static file serving to backend:
```typescript
// In backend/src/index.ts
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

**Option B: Separate Frontend Service**

1. Create new service
2. Root directory: `frontend`
3. Build command: `npm ci && npm run build`
4. Start command: `npx serve -s dist -l $PORT`
5. Or use Railway's static site template

### 7. Deploy Open Notebook

1. Create new service for Open Notebook
2. Connect Open Notebook repository
3. Configure Open Notebook's Railway deployment
4. Get the public URL: `https://your-open-notebook.railway.app`
5. Update backend `OPEN_NOTEBOOK_URL` to this URL

### 8. Run Database Migrations

After first deployment:

**Option A: Via Railway CLI**
```bash
railway run --service backend npm run db:migrate --workspace=backend
```

**Option B: Via Railway Shell**
```bash
railway shell
cd backend
npm run db:migrate
```

**Option C: One-time Migration Service**
Create a temporary service that runs migrations then exits.

### 9. Seed Database (Optional)

```bash
railway run --service backend npm run db:seed --workspace=backend
```

## Railway-Specific Configuration

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build --workspaces --if-present"
  },
  "deploy": {
    "startCommand": "npm run start --workspace=backend",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml

Railway uses Nixpacks for automatic builds. The `nixpacks.toml` file customizes the build:

```toml
[phases.setup]
nixPkgs = ["nodejs_18", "npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = [
  "npm run build --workspace=shared",
  "npm run build --workspace=agents",
  "npm run build --workspace=backend",
  "npm run build --workspace=frontend"
]

[start]
cmd = "npm run start --workspace=backend"
```

## Environment Variables Reference

### Required Variables

```bash
# Database (provided by Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Server
PORT=3001  # Railway sets $PORT automatically
NODE_ENV=production

# Authentication
JWT_SECRET=generate-secure-random-string
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=sk-...

# CORS
FRONTEND_URL=https://your-frontend.railway.app
```

### Optional Variables

```bash
# Redis (if using Railway Redis)
REDIS_URL=redis://...

# OpenAI Model
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo

# RAG Configuration
OPEN_NOTEBOOK_URL=https://your-open-notebook.railway.app
RAG_ENABLED=true

# API URL
API_URL=https://your-backend.railway.app
```

## Service Communication

### Railway Service Variables

Railway provides automatic service discovery:
```bash
# Access other services using Railway's service references
OPEN_NOTEBOOK_URL=${{OpenNotebook.RAILWAY_PUBLIC_DOMAIN}}

# Or use private networking
OPEN_NOTEBOOK_URL=${{OpenNotebook.RAILWAY_PRIVATE_DOMAIN}}
```

### Private Networking

Services in the same Railway project can communicate via:
- `${{ServiceName.RAILWAY_PRIVATE_DOMAIN}}` - Internal URL
- Private network (no external traffic)

## Database Management

### Run Migrations

```bash
# Via CLI
railway run --service backend npm run db:migrate --workspace=backend

# Or via Railway dashboard
# Services → Backend → Deployments → Run Command
```

### Connect to Database

```bash
# Get connection string
railway variables

# Connect via psql
railway connect postgres
```

### Backup Database

Railway provides automatic backups for PostgreSQL. Access via:
- Railway dashboard → Database → Backups

## Continuous Deployment

Railway automatically deploys on:
- Push to main/master branch (production)
- Manual deployments from dashboard

Configure in:
- Railway dashboard → Service → Settings → Source

## Monitoring & Logs

### View Logs

```bash
# Via CLI
railway logs

# Via Dashboard
# Service → Deployments → View Logs
```

### Metrics

Railway dashboard provides:
- CPU usage
- Memory usage
- Network traffic
- Request metrics

## Troubleshooting

### Build Failures

1. Check build logs in Railway dashboard
2. Verify Node.js version (use `.nvmrc` if needed)
3. Ensure all dependencies are in `package.json`
4. Check workspace dependencies are correct

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check database service is running
3. Ensure migrations have run
4. Check connection limits

### RAG / Open Notebook Connection

1. Verify `OPEN_NOTEBOOK_URL` is correct
2. Check Open Notebook service is running
3. Test Open Notebook health endpoint
4. Review CORS settings if needed

### Port Configuration

Railway sets `$PORT` automatically. Your app should use:
```typescript
const PORT = process.env.PORT || 3001;
```

## Cost Considerations

### Railway Pricing

- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **Enterprise**: Custom pricing

### Resource Usage

Monitor:
- Database storage
- Compute hours
- Bandwidth
- Open Notebook compute (separate service)

### Cost Optimization

1. Use Railway's sleep settings for dev environments
2. Monitor database size
3. Use appropriate instance sizes
4. Enable auto-scaling if needed

## Production Checklist

- [ ] PostgreSQL database provisioned
- [ ] Redis provisioned (if using)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded (if needed)
- [ ] Open Notebook deployed and accessible
- [ ] CORS configured correctly
- [ ] JWT_SECRET set (strong random value)
- [ ] OpenAI API key configured
- [ ] RAG integration tested
- [ ] Health checks passing
- [ ] Logs monitoring set up
- [ ] Backups enabled for database

## Quick Deploy

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Link to existing project (or create new)
railway link

# 5. Add PostgreSQL
# (via Railway dashboard: New → Database → PostgreSQL)

# 6. Deploy
railway up

# 7. Set environment variables
railway variables

# 8. Run migrations
railway run --service backend npm run db:migrate --workspace=backend
```

## Open Notebook on Railway

Since Open Notebook needs its own backend and database:

1. **Create Separate Railway Project** (recommended) or service
2. **Deploy Open Notebook** following its documentation
3. **Add Open Notebook Database** (separate PostgreSQL instance)
4. **Get Public URL** from Open Notebook service
5. **Update Backend** `OPEN_NOTEBOOK_URL` to point to Open Notebook

Both services can be in the same Railway project for easier management.

## Support Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

