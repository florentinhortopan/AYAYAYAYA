# Setup Guide

## Prerequisites

1. **Node.js 18+** - ✅ Installed
2. **Docker & Docker Compose** - ⚠️ Not installed (required for database)
3. **PostgreSQL** (if not using Docker) - Available locally

## Step-by-Step Setup

### 1. Environment Variables ✅
The `.env` file has been created with default values. Update the following before production:
- `JWT_SECRET` - Change to a secure random string
- `OPENAI_API_KEY` - Add your OpenAI API key for AI agents
- Database credentials if using local PostgreSQL

### 2. Start Docker Services ⚠️

**Option A: Using Docker (Recommended)**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop

# Start services
docker compose up -d

# Verify services are running
docker compose ps
```

**Option B: Using Local PostgreSQL**
If you have PostgreSQL installed locally:
1. Create a database:
   ```bash
   createdb army_recruitment
   ```
2. Update `.env` with your local PostgreSQL credentials:
   ```
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   ```

### 3. Run Database Migrations

Once the database is available:
```bash
npm run db:migrate --workspace=backend
```

### 4. (Optional) Seed Database
```bash
npm run db:seed --workspace=backend
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `.env` file has correct database credentials
- Verify Docker containers are running: `docker compose ps`

### Port Already in Use
- Change ports in `.env` file if 3000 or 3001 are already in use
- Update `FRONTEND_PORT` and `API_PORT` accordingly

### Missing Dependencies
```bash
npm install
```

### Build Errors
```bash
# Build shared packages first
npm run build --workspace=shared
npm run build --workspace=agents
```

## Next Steps

1. Install Docker Desktop
2. Start Docker services: `docker compose up -d`
3. Run migrations: `npm run db:migrate --workspace=backend`
4. Start dev servers: `npm run dev`

