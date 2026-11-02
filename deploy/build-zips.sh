#!/usr/bin/env bash
# Builds production deployment archives for HayHost cPanel:
#   deploy/backend.zip   → extract into /home/etbgahjl/seafurniture_api   (Node.js app: dist/main.js)
#   deploy/frontend.zip  → extract into /home/etbgahjl/seafurniture_web   (Node.js app: app.cjs)
#
# Usage (from the repository root, on your computer):
#   cp frontend/.env.example frontend/.env.production   # once; check the URLs
#   bash deploy/build-zips.sh            # both archives
#   bash deploy/build-zips.sh frontend   # only frontend.zip
#   bash deploy/build-zips.sh backend    # only backend.zip
#
# The archives never contain node_modules, .git, logs, .env files or secrets.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-all}"
case "$TARGET" in all|backend|frontend) ;; *) echo "✗ usage: $0 [all|backend|frontend]" >&2; exit 1 ;; esac
want() { [ "$TARGET" = all ] || [ "$TARGET" = "$1" ]; }

ENV_FILE="frontend/.env.production"
[ -f "$ENV_FILE" ] || { echo "✗ $ENV_FILE not found — copy it from frontend/.env.example" >&2; exit 1; }

read_var() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | sed -e 's/^["'\'']//' -e 's/["'\'']$//'; }
export VITE_API_URL="$(read_var VITE_API_URL)"
export NUXT_PUBLIC_SITE_URL="$(read_var NUXT_PUBLIC_SITE_URL)"
export NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION="$(read_var NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION)"  # optional
[ -n "$VITE_API_URL" ] && [ -n "$NUXT_PUBLIC_SITE_URL" ] || { echo "✗ VITE_API_URL and NUXT_PUBLIC_SITE_URL must be set in $ENV_FILE" >&2; exit 1; }
echo "→ Site: $NUXT_PUBLIC_SITE_URL   API: $VITE_API_URL"

echo "→ Installing dependencies (npm ci)"
npm ci --no-audit --no-fund

if want backend; then
  echo "→ Type checks"
  npm run typecheck -w backend

  echo "→ Building backend (production)"
  NODE_ENV=production npm run build -w backend
  npm run build:seed -w backend
  [ -f backend/dist/main.js ] || { echo "✗ backend/dist/main.js was not produced" >&2; exit 1; }
fi

if want frontend; then
  echo "→ Building frontend (production)"
  NODE_ENV=production npm run build -w frontend
  [ -f frontend/.output/server/index.mjs ] || { echo "✗ frontend build output missing" >&2; exit 1; }
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

forbidden() {
  # the only allowed node_modules is the Nuxt build's own .output/server/node_modules
  printf '%s\n' "$1" | grep -v '^\.output/server/node_modules/' | grep -Eq '(^|/)(node_modules|\.git|\.idea|logs)/|(^|/)\.env$'
}

if want backend; then
  echo "→ Packing backend.zip"
  B="$STAGE/backend"
  mkdir -p "$B/prisma" "$B/scripts"
  cp backend/package.json "$B/"
  cp -R backend/dist backend/dist-seed "$B/"
  cp backend/prisma/schema.prisma "$B/prisma/"
  cp -R backend/prisma/migrations "$B/prisma/"
  cp backend/scripts/with-db.cjs "$B/scripts/"
  cp backend/.env.production.example "$B/"
  find "$B/dist" \( -name '*.map' -o -name '*.tsbuildinfo' \) -delete
  # Standalone lockfile: the server installs exactly the tested dependency versions
  ( cd "$B" && npm install --package-lock-only --ignore-scripts --no-audit --no-fund >/dev/null )

  rm -f deploy/backend.zip
  ( cd "$B" && zip -qr "$ROOT/deploy/backend.zip" . -x '*.env' -x '.env' -x '*/node_modules/*' )

  BACK_LIST="$(unzip -Z1 deploy/backend.zip)"
  forbidden "$BACK_LIST" && { echo "✗ backend.zip contains forbidden files (node_modules/.git/.idea/logs/.env)" >&2; exit 1; }
  printf '%s\n' "$BACK_LIST" | grep -qx 'package.json' || { echo "✗ backend.zip: package.json must be at the archive root" >&2; exit 1; }
  printf '%s\n' "$BACK_LIST" | grep -qx 'dist/main.js' || { echo "✗ backend.zip: dist/main.js missing" >&2; exit 1; }
  echo "✔ deploy/backend.zip  ($(du -h deploy/backend.zip | cut -f1))"
fi

if want frontend; then
  echo "→ Packing frontend.zip"
  F="$STAGE/frontend"
  mkdir -p "$F"
  cp -R frontend/.output "$F/.output"
  cp deploy/hosting/app.cjs "$F/app.cjs"
  cp deploy/hosting/frontend-package.json "$F/package.json"

  rm -f deploy/frontend.zip
  # .output/server/node_modules is part of the Nuxt build (traced runtime deps) and MUST be included
  ( cd "$F" && zip -qr "$ROOT/deploy/frontend.zip" . -x '.env' )

  FRONT_LIST="$(unzip -Z1 deploy/frontend.zip)"
  forbidden "$FRONT_LIST" && { echo "✗ frontend.zip contains forbidden files (node_modules/.git/.idea/logs/.env)" >&2; exit 1; }
  printf '%s\n' "$FRONT_LIST" | grep -q '^\.output/server/node_modules/' || { echo "✗ frontend.zip is missing .output/server/node_modules" >&2; exit 1; }
  printf '%s\n' "$FRONT_LIST" | grep -qx 'app.cjs' || { echo "✗ frontend.zip: app.cjs missing" >&2; exit 1; }
  echo "✔ deploy/frontend.zip ($(du -h deploy/frontend.zip | cut -f1))"
fi

echo "  Next: bash deploy/deploy-hosting.sh  (or deploy/DEPLOY.md for manual upload)"
