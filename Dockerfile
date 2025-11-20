# Multi-stage build for Railway deployment
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY agents/package*.json ./agents/
COPY shared/package*.json ./shared/

RUN npm ci

# Build stage
FROM base AS build

COPY . .
RUN npm run build --workspaces --if-present

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/agents/dist ./agents/dist
COPY --from=build /app/agents/package.json ./agents/package.json
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/shared/package.json ./shared/package.json
COPY --from=build /app/package.json ./

# Expose port (Railway sets PORT dynamically)
EXPOSE ${PORT:-3001}

# Start backend server
CMD ["npm", "run", "start", "--workspace=backend"]

