# Vercel Deployment Guide

## Overview

This guide covers deploying the Army Recruitment Platform to Vercel. Vercel will host:
- **Frontend**: Static React app (served from `frontend/dist`)
- **Backend API**: Express serverless functions (via `api/index.ts`)

## Prerequisites

1. Vercel account (https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. GitHub repository (for automatic deployments)
4. External PostgreSQL database (Vercel doesn't host databases)
5. External Redis (optional, for caching)

## Architecture

### Frontend
- Built with Vite + React
- Served as static files from `frontend/dist`
- Client-side routing with React Router

### Backend API
- Express.js app wrapped as Vercel serverless function
- Entry point: `api/index.ts`
- All routes under `/api/*` are handled by the serverless function
- Maximum execution time: 30 seconds (can be increased on Pro plan)

## Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 2. Connect Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings (see below)

### 3. Configure Project Settings in Vercel Dashboard

**Root Directory**: Leave as root (`.`)

**Build Command**:
```bash
npm install && npm run build --workspace=shared && npm run build --workspace=agents && npm run build --workspace=backend && npm run build --workspace=frontend
```

**Output Directory**: `frontend/dist`

**Install Command**: `npm install`

**Node.js Version**: 18.x

### 4. Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

#### Required Variables

```bash
# Database (external PostgreSQL - e.g., Supabase, Neon, Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# Server
NODE_ENV=production

# Authentication
JWT_SECRET=your-secure-random-secret-key-here
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=sk-...

# CORS (will be set automatically to your Vercel domain)
FRONTEND_URL=https://your-app.vercel.app
```

#### Optional Variables

```bash
# Redis (if using external Redis - e.g., Upstash)
REDIS_URL=redis://...

# OpenAI Model
OPENAI_MODEL=gpt-4

# RAG Configuration
OPEN_NOTEBOOK_URL=https://your-open-notebook-url
RAG_ENABLED=true

# API URL
API_URL=https://your-app.vercel.app
```

### 5. External Services Setup

#### PostgreSQL Database

**Option A: Supabase (Recommended)**
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Settings → Database
4. Set `DATABASE_URL` in Vercel environment variables

**Option B: Neon**
1. Go to https://neon.tech
2. Create a new project
3. Get connection string
4. Set `DATABASE_URL` in Vercel environment variables

**Option C: Railway**
1. Deploy PostgreSQL on Railway separately
2. Get connection string
3. Set `DATABASE_URL` in Vercel environment variables

#### Redis (Optional)

**Option A: Upstash (Recommended)**
1. Go to https://upstash.com
2. Create a Redis database
3. Get connection string
4. Set `REDIS_URL` in Vercel environment variables

**Option B: Railway**
1. Deploy Redis on Railway
2. Get connection string
3. Set `REDIS_URL` in Vercel environment variables

### 6. Run Database Migrations

After deployment, run migrations:

**Option A: Via Vercel CLI**
```bash
vercel env pull .env.local
npm run db:migrate --workspace=backend
```

**Option B: Via External Database Tool**
Connect to your PostgreSQL database and run the migration SQL files:
- `backend/src/database/migrations/001_initial_schema.sql`
- `backend/src/database/migrations/002_add_admin_fields.sql`
- `backend/src/database/migrations/003_agent_configurations.sql`

**Option C: Via Vercel Functions (One-time)**
Create a temporary migration function in `api/migrate.ts` and call it once.

### 7. Deploy

**Via Dashboard:**
1. Push to GitHub (main branch)
2. Vercel automatically deploys

**Via CLI:**
```bash
vercel --prod
```

## Project Structure for Vercel

```
.
├── api/
│   └── index.ts          # Vercel serverless function entry point
├── backend/
│   ├── src/
│   │   └── index.ts      # Express app (exported for Vercel)
│   └── dist/             # Compiled backend
├── frontend/
│   └── dist/             # Built frontend (served as static)
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json (monorepo)
```

## How It Works

1. **Build Process**:
   - Vercel runs the build command
   - Builds shared → agents → backend → frontend in order
   - Outputs frontend dist files

2. **Request Routing**:
   - `/api/*` requests → routed to `api/index.ts` (serverless function)
   - All other requests → served from `frontend/dist` (static files)

3. **Serverless Functions**:
   - `api/index.ts` imports the compiled Express app
   - Express handles all `/api/*` routes
   - Function runs on-demand (cold starts possible)

## Limitations & Considerations

### Serverless Function Limits

- **Free Plan**:
  - 100GB-hours execution time
  - 10-second timeout
  - Cold starts can add latency

- **Pro Plan** ($20/month):
  - 1000GB-hours execution time
  - 60-second timeout
  - Faster cold starts

### Database Connections

- Use connection pooling (recommended: PgBouncer)
- Keep connections short-lived
- Consider using serverless-friendly databases (Neon, Supabase)

### Environment Variables

- Set separately for Production, Preview, and Development
- Secrets are encrypted
- Can be added via CLI: `vercel env add KEY`

## Troubleshooting

### Build Failures

1. **TypeScript Errors**:
   - Ensure all workspace dependencies are built first
   - Check `tsconfig.json` path mappings

2. **Module Not Found**:
   - Verify workspace dependencies in `package.json`
   - Check build order matches workspace dependencies

3. **Out of Memory**:
   - Increase function memory in `vercel.json`
   - Optimize bundle size

### Runtime Errors

1. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Check database allows connections from Vercel IPs
   - Ensure SSL is enabled if required

2. **Cold Start Latency**:
   - First request after inactivity can be slow
   - Use Vercel Pro plan for better performance
   - Consider keeping functions warm (ping endpoint)

3. **Timeout Errors**:
   - Increase `maxDuration` in `vercel.json`
   - Optimize slow endpoints
   - Consider Pro plan for longer timeouts

### CORS Issues

- Frontend URL is automatically set by Vercel
- Check `FRONTEND_URL` environment variable
- Verify CORS configuration in backend

## Cost Considerations

### Vercel Pricing

- **Hobby Plan** (Free):
  - Unlimited bandwidth
  - 100GB-hours functions
  - 10-second function timeout
  - Suitable for development/testing

- **Pro Plan** ($20/month):
  - Everything in Hobby
  - 1000GB-hours functions
  - 60-second function timeout
  - Better performance
  - Recommended for production

### External Services

- **PostgreSQL**: ~$0-25/month (depending on provider)
- **Redis**: ~$0-10/month (optional)
- **OpenAI API**: Pay-as-you-go

## Production Checklist

- [ ] External PostgreSQL database provisioned
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run
- [ ] Frontend build successful
- [ ] Backend builds successfully
- [ ] API endpoints tested
- [ ] CORS configured correctly
- [ ] JWT_SECRET set (strong random value)
- [ ] OpenAI API key configured
- [ ] Health check endpoint working (`/health`)
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic with Vercel)

## Quick Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
# ... add other variables

# 5. Deploy
vercel --prod
```

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Serverless Functions Guide: https://vercel.com/docs/functions

