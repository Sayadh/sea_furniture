#!/usr/bin/env bash
# Zero-surprise update script for the VPS. Run from the repository root:  bash deploy/deploy.sh
set -euo pipefail

echo "→ Pulling latest code"
git pull --ff-only

echo "→ Installing dependencies"
npm ci

echo "→ Applying database migrations"
npm run prisma:migrate:deploy -w backend

echo "→ Building backend and frontend"
npm run build

echo "→ Reloading PM2 processes"
pm2 reload ecosystem.config.cjs --update-env
pm2 save

echo "✔ Deployed"
