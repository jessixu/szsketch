#!/bin/bash
set -e

echo "=== Deploying szsketch ==="
cd /var/www/szsketch

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build Next.js
echo "Building..."
npm run build

# Restart PM2
pm2 restart szsketch || pm2 start ecosystem.config.js

# Reload Nginx
sudo nginx -t && sudo nginx -s reload

# Create uploads dir
mkdir -p uploads

echo "=== Deploy complete: $(date) ==="
pm2 status
