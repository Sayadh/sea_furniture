#!/usr/bin/env bash
# Runs ON THE SERVER (sent over SSH by deploy/deploy-hosting.sh). Never edit files by hand on the server.
#
#   remote-release.sh install  <app dir> <zip> <api|web>   stage the zip, swap releases, print NEED_* flags
#   remote-release.sh npm      <app dir> <app name>         npm install (production) in the app's nodevenv
#   remote-release.sh migrate  <app dir> <app name>         prisma migrate deploy (DB password on stdin if .env has none)
#   remote-release.sh restart  <app dir> <app name>
#   remote-release.sh rollback <app dir> <api|web>
set -euo pipefail

ACTION="$1"; DIR="$2"
PREV=".deploy_prev"; NEW=".deploy_new"; FAILED=".deploy_failed"
NODE_VERSION="${NODE_VERSION:-22}"
NODEVENV_ROOT="${NODEVENV_ROOT:-$HOME/nodevenv}"

items() {
  case "$1" in
    api) echo "dist dist-seed prisma scripts package.json package-lock.json .env.production.example" ;;
    web) echo ".output app.cjs package.json" ;;
    *) echo "unknown kind: $1" >&2; exit 2 ;;
  esac
}

extract() {  # extract <zip> <dest>
  if command -v unzip >/dev/null; then unzip -oq "$1" -d "$2"
  else python3 -c 'import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' "$1" "$2"; fi
}

hash_of() { if [ -e "$1" ]; then sha256sum "$1" | cut -c1-16; else echo none; fi; }
migrations_hash() { if [ -d "$1" ]; then (cd "$1" && find . -name migration.sql | sort | xargs -r cat | sha256sum | cut -c1-16); else echo none; fi; }

activate() {  # activate <app name>
  local a="$NODEVENV_ROOT/$1/$NODE_VERSION/bin/activate"
  [ -f "$a" ] || { echo "nodevenv not found: $a" >&2; exit 3; }
  # shellcheck disable=SC1090
  set +u; source "$a"; set -u
}

cd "$DIR"

case "$ACTION" in
  install)
    ZIP="$3"; KIND="$4"
    rm -rf "$NEW"; mkdir "$NEW"
    extract "$ZIP" "$NEW"
    rm -f "$ZIP"
    for i in $(items "$KIND"); do
      [ -e "$NEW/$i" ] || { echo "archive is missing $i" >&2; rm -rf "$NEW"; exit 4; }
    done

    if [ "$KIND" = api ]; then
      if [ "$(hash_of package-lock.json)" != "$(hash_of "$NEW/package-lock.json")" ] ||
         [ "$(hash_of prisma/schema.prisma)" != "$(hash_of "$NEW/prisma/schema.prisma")" ]; then echo "NEED_NPM=1"; else echo "NEED_NPM=0"; fi
      if [ "$(migrations_hash prisma/migrations)" != "$(migrations_hash "$NEW/prisma/migrations")" ]; then echo "NEED_MIGRATE=1"; else echo "NEED_MIGRATE=0"; fi
    fi

    # Swap: current → $PREV, new → live (each item is a single rename, so the gap is milliseconds)
    rm -rf "$PREV"; mkdir "$PREV"
    for i in $(items "$KIND"); do
      if [ -e "$i" ]; then mv "$i" "$PREV/"; fi
      mv "$NEW/$i" .
    done
    rm -rf "$NEW"
    echo "SWAPPED=1"
    ;;

  npm)
    APP="$3"; activate "$APP"
    # The nodevenv keeps node_modules in its lib dir with package.json symlinked there (same as "Run NPM Install")
    LIB="$NODEVENV_ROOT/$APP/$NODE_VERSION/lib"
    if [ -e "$LIB/package.json" ]; then cd "$LIB"; fi
    npm install --omit=dev --no-audit --no-fund
    ;;

  migrate)
    APP="$3"; activate "$APP"
    if ! grep -qs '^DB_PASSWORD=.' .env && [ -z "${DATABASE_URL:-}" ]; then
      export DB_HOST="${DB_HOST:-localhost}" DB_PORT="${DB_PORT:-3306}"
      export DB_DATABASE="${DB_DATABASE:-etbgahjl_seafurniture}" DB_USERNAME="${DB_USERNAME:-etbgahjl_seauser}"
      IFS= read -r DB_PASSWORD; export DB_PASSWORD   # comes over SSH stdin, never on the command line
    fi
    npm run migrate:deploy
    ;;

  restart)
    APP="$3"
    if command -v cloudlinux-selector >/dev/null && \
       cloudlinux-selector restart --json --interpreter nodejs --app-root "$APP" >/dev/null 2>&1; then
      echo "restarted (cloudlinux-selector)"
    else
      mkdir -p tmp && touch tmp/restart.txt && echo "restarted (tmp/restart.txt)"
    fi
    ;;

  rollback)
    KIND="$3"
    first="$(items "$KIND" | cut -d' ' -f1)"
    [ -e "$PREV/$first" ] || { echo "nothing to roll back to ($DIR/$PREV/$first missing)" >&2; exit 5; }
    rm -rf "$FAILED"; mkdir "$FAILED"
    for i in $(items "$KIND"); do
      if [ -e "$i" ]; then mv "$i" "$FAILED/"; fi
      if [ -e "$PREV/$i" ]; then mv "$PREV/$i" .; fi
    done
    echo "ROLLED_BACK=1"
    ;;

  *) echo "unknown action $ACTION" >&2; exit 2 ;;
esac
