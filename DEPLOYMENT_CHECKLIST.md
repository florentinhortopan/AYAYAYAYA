# Railway Deployment Readiness Checklist

## ✅ Build Configuration

- [x] **TypeScript Build Errors Fixed**
  - PORT type error resolved (parseInt)
  - JWT expiresIn type errors resolved
  - Module resolution for @army-recruitment/agents fixed
  - TypeScript project references configured

- [x] **Railway Configuration Files**
  - `railway.json` - Build and deploy config
  - `railway.toml` - Railway settings with healthcheck
  - `nixpacks.toml` - Custom build phases (correct build order)
  - `Dockerfile` - Alternative Docker build
  - `Procfile` - Process definition
  - `.nvmrc` - Node.js version (18)

- [x] **Build Order**
  - Shared → Agents → Backend → Frontend (correct dependency order)

- [x] **Ignore Files**
  - `.railwayignore` - Excludes unnecessary files
  - `.dockerignore` - Docker build exclusions
  - `.gitignore` - Git exclusions

## ⚠️ Required Environment Variables

Set these in Railway dashboard before deployment:

### **Required (Must Set)**
```bash
# Database (Railway auto-provides if PostgreSQL service added)
DATABASE_URL=postgresql://...  # Auto-provided by Railway PostgreSQL

# Server
NODE_ENV=production

# Authentication (CRITICAL - Generate secure random string)
JWT_SECRET=your-secure-random-secret-key-here
JWT_EXPIRES_IN=7d

# AI Services (Required for agents to work)
OPENAI_API_KEY=sk-...

# CORS (Set to your Railway app URL after deployment)
FRONTEND_URL=https://your-app.railway.app
```

### **Optional (Recommended)**
```bash
# Redis (if using Railway Redis service)
REDIS_URL=redis://...  # Auto-provided by Railway Redis

# OpenAI Model
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo

# RAG Configuration (if using Open Notebook)
OPEN_NOTEBOOK_URL=https://your-open-notebook.railway.app
RAG_ENABLED=true

# API URL (for agent config service)
API_URL=https://your-backend.railway.app
```

## 📋 Pre-Deployment Steps

### 1. **Generate JWT Secret**
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. **Prepare Database**
- Add PostgreSQL service in Railway dashboard
- Railway will auto-provide `DATABASE_URL`
- Run migrations after first deployment

### 3. **Deploy to Railway**

**Option A: Via Railway Dashboard**
1. Create new project in Railway
2. Connect GitHub repository
3. Add PostgreSQL database service
4. Set environment variables
5. Deploy

**Option B: Via Railway CLI**
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (or create new)
railway link

# Add PostgreSQL (via dashboard or CLI)
railway add postgresql

# Set environment variables
railway variables set JWT_SECRET=your-secret
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-...
# ... set other variables

# Deploy
railway up
```

## 🔄 Post-Deployment Steps

### 1. **Run Database Migrations**
```bash
railway run --service backend npm run db:migrate --workspace=backend
```

### 2. **Verify Health Check**
```bash
curl https://your-app.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. **Update FRONTEND_URL**
After deployment, update the `FRONTEND_URL` environment variable to your actual Railway domain:
```bash
railway variables set FRONTEND_URL=https://your-actual-domain.railway.app
```

### 4. **Test API Endpoints**
```bash
# Health check
curl https://your-app.railway.app/health

# API info
curl https://your-app.railway.app/
```

## 🚨 Common Issues & Solutions

### Build Fails
- **Issue**: TypeScript errors
- **Solution**: All build errors have been fixed. If new errors appear, check workspace dependencies

### Database Connection Fails
- **Issue**: `DATABASE_URL` not set or incorrect
- **Solution**: Verify PostgreSQL service is added and `DATABASE_URL` is auto-provided

### Port Already in Use
- **Issue**: Railway sets `PORT` automatically - this is handled in code
- **Solution**: No action needed - code uses `process.env.PORT`

### Module Not Found (@army-recruitment/agents)
- **Issue**: Workspace dependencies not resolved
- **Solution**: Fixed with path mapping and project references in tsconfig.json

### JWT Errors
- **Issue**: `JWT_SECRET` not set or too weak
- **Solution**: Generate secure random string and set in Railway variables

## ✅ Deployment Readiness Status

**Status: READY FOR DEPLOYMENT** ✅

All build errors have been fixed:
- ✅ TypeScript compilation errors resolved
- ✅ Module resolution configured
- ✅ Build order correct
- ✅ Railway configuration files present
- ✅ Environment variable handling correct
- ✅ Health check endpoint configured
- ✅ Static file serving for frontend configured

## 📝 Next Steps

1. **Push to GitHub** (if not already done)
2. **Create Railway Project**
3. **Add PostgreSQL Database**
4. **Set Environment Variables**
5. **Deploy**
6. **Run Migrations**
7. **Test Application**

## 🔗 Resources

- Railway Docs: https://docs.railway.app
- Deployment Guide: `RAILWAY_DEPLOYMENT.md`
- Environment Variables: See `RAILWAY_DEPLOYMENT.md` section "Environment Variables Reference"

