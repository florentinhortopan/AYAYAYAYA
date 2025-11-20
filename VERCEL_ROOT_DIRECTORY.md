# Vercel Root Directory Configuration

## ⚠️ IMPORTANT: Root Directory Must Be `.` (Project Root)

**DO NOT** set the root directory to `/backend` or any subdirectory.

## Why Root Directory Must Be `.` (Project Root)

### 1. **Monorepo Structure**
This is a monorepo with multiple workspaces:
```
.
├── package.json          ← Defines workspaces
├── vercel.json          ← Vercel config (at root)
├── api/
│   └── index.ts         ← Serverless function entry point
├── backend/             ← Workspace 1
├── frontend/            ← Workspace 2 (needs to be built)
├── agents/              ← Workspace 3 (needs to be built)
└── shared/              ← Workspace 4 (needs to be built)
```

### 2. **Vercel Configuration**
- `vercel.json` is at the root
- Build command references all workspaces
- Output directory is `frontend/dist`
- API function is at `api/index.ts`

### 3. **What Breaks If Root Is `/backend`**

❌ **vercel.json won't be found**
- Vercel looks for `vercel.json` in the root directory
- If root is `/backend`, it won't find the config

❌ **api/index.ts won't be found**
- Serverless function entry point is at `api/index.ts` (root level)
- If root is `/backend`, Vercel won't see the `api/` folder

❌ **Frontend won't be built**
- Build command builds all workspaces including frontend
- Frontend needs to be served from `frontend/dist`
- If root is `/backend`, frontend won't exist

❌ **Workspace dependencies won't resolve**
- `package.json` at root defines workspaces
- Backend depends on `@army-recruitment/agents` and `@army-recruitment/shared`
- If root is `/backend`, npm won't see the workspace structure

❌ **Build command will fail**
- Build command: `npm run build --workspace=shared && npm run build --workspace=agents && npm run build --workspace=backend && npm run build --workspace=frontend`
- If root is `/backend`, it can't access other workspaces

## ✅ Correct Vercel Settings

### Root Directory
```
. (project root)
```
OR leave it empty/default

### Build Command
Already defined in `vercel.json`:
```
npm install && npm run build --workspace=shared && npm run build --workspace=agents && npm run build --workspace=backend && npm run build --workspace=frontend
```

### Output Directory
Already defined in `vercel.json`:
```
frontend/dist
```

### Install Command
```
npm install
```

## How to Set in Vercel Dashboard

1. Go to your project settings
2. Find "Root Directory" setting
3. **Leave it empty** or set to `.`
4. **DO NOT** set it to `backend` or any subdirectory

## Verification

After setting root directory to `.`, Vercel should:
- ✅ Find `vercel.json` at root
- ✅ Find `api/index.ts` for serverless functions
- ✅ Build all workspaces in correct order
- ✅ Serve frontend from `frontend/dist`
- ✅ Route `/api/*` to serverless function

## If Vercel Auto-Detects `/backend`

If Vercel suggests `/backend` as root:
1. **Manually override** it to `.` (project root)
2. Or leave it empty (Vercel will use project root)
3. The auto-detection might be wrong for monorepos

## Summary

**Root Directory = `.` (project root)**

This allows Vercel to:
- See all workspaces
- Build everything correctly
- Serve both frontend and backend
- Resolve workspace dependencies

