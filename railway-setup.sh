#!/bin/bash
# Railway setup script - runs migrations after deployment

echo "Running database migrations..."
npm run db:migrate --workspace=backend

echo "Setup complete!"

