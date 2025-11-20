# Database Migration Guide

## Where to Run Migrations

### 🏠 **Local Development**

From the project root directory:

```bash
# Option 1: Using npm workspace command
npm run db:migrate --workspace=backend

# Option 2: From backend directory
cd backend
npm run db:migrate
```

**Prerequisites:**
- PostgreSQL database running (local or Docker)
- `.env` file configured with database credentials
- Database connection working

**What it does:**
- Runs all SQL migration files in `backend/src/database/migrations/`
- Tracks applied migrations in `schema_migrations` table
- Skips already-applied migrations automatically

---

### 🚂 **Railway Deployment**

After deploying to Railway, run migrations using one of these methods:

#### **Option 1: Railway CLI (Recommended)**

```bash
# Make sure you're logged in
railway login

# Link to your project (if not already linked)
railway link

# Run migrations
railway run --service backend npm run db:migrate --workspace=backend
```

#### **Option 2: Railway Dashboard**

1. Go to your Railway project dashboard
2. Click on your **Backend** service
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **Run Command**
6. Enter: `npm run db:migrate --workspace=backend`
7. Click **Run**

#### **Option 3: Railway Shell**

```bash
# Open a shell in your Railway service
railway shell

# Navigate to backend (if needed)
cd backend

# Run migrations
npm run db:migrate
```

---

## Migration Files

Migrations are located in: `backend/src/database/migrations/`

Current migrations:
- `001_initial_schema.sql` - Initial database schema
- `002_add_admin_fields.sql` - Admin user fields
- `003_agent_configurations.sql` - Agent configuration tables

---

## Migration Tracking

The migration system automatically:
- ✅ Creates a `schema_migrations` table to track applied migrations
- ✅ Skips migrations that have already been run
- ✅ Runs migrations in order (001, 002, 003...)
- ✅ Uses transactions for safety (rolls back on error)

---

## Troubleshooting

### "Migration already applied" message
- This is normal - the migration system skips already-run migrations
- Safe to run migrations multiple times

### "Connection refused" error
- Check your database is running
- Verify `.env` file has correct `DATABASE_URL` or connection details
- For Railway: Ensure PostgreSQL service is added and running

### "Table already exists" error
- This usually means migrations ran partially
- Check `schema_migrations` table to see what's been applied
- You may need to manually fix the database state

### Railway: "Command not found"
- Make sure you're in the correct service
- Verify the backend workspace exists
- Try: `railway run --service backend sh -c "cd backend && npm run db:migrate"`

---

## Verifying Migrations

### Check Applied Migrations

**Local (PostgreSQL):**
```bash
psql -d army_recruitment -c "SELECT * FROM schema_migrations ORDER BY applied_at;"
```

**Railway:**
```bash
railway connect postgres
# Then in psql:
SELECT * FROM schema_migrations ORDER BY applied_at;
```

### Check Tables Created

**Local:**
```bash
psql -d army_recruitment -c "\dt"
```

**Railway:**
```bash
railway connect postgres
# Then in psql:
\dt
```

---

## When to Run Migrations

### ✅ **Run migrations:**
- After first deployment to Railway
- After pulling new code with new migration files
- When setting up a new database
- After database reset

### ❌ **Don't run migrations:**
- On every code deployment (only if new migrations exist)
- If migrations are already applied (safe, but unnecessary)

---

## Best Practices

1. **Always run migrations after first deployment**
2. **Check migration status before running** (optional but recommended)
3. **Run migrations in production during low-traffic periods** (if possible)
4. **Backup database before running migrations** (especially in production)
5. **Test migrations locally first** before deploying to production

---

## Quick Reference

```bash
# Local
npm run db:migrate --workspace=backend

# Railway CLI
railway run --service backend npm run db:migrate --workspace=backend

# Railway Dashboard
# Services → Backend → Deployments → Run Command → npm run db:migrate --workspace=backend
```

