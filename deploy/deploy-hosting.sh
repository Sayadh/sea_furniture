#!/usr/bin/env bash
# One-command deploy to HayHost cPanel over SSH (host alias "seafurniture" in ~/.ssh/config, port 2686).
#
#   bash deploy/deploy-hosting.sh                 # build + deploy API and site
#   bash deploy/deploy-hosting.sh frontend        # only the site
#   bash deploy/deploy-hosting.sh backend         # only the API
#   bash deploy/deploy-hosting.sh frontend --skip-build   # upload the existing deploy/*.zip
#   bash deploy/deploy-hosting.sh rollback frontend|backend
#   bash deploy/deploy-hosting.sh check           # test SSH access
#
# Backend: npm install runs only when package-lock.json or prisma/schema.prisma changed,
# migrations only when there are new ones. The DB password is asked with a hidden prompt
# (unless the server's seafurniture_api/.env has DB_PASSWORD) and sent over SSH stdin only.
set -euo pipefail

SSH_HOST="${SSH_HOST:-seafurniture}"
API_APP="seafurniture_api"
WEB_APP="seafurniture_web"
API_HEALTH_URL="${API_HEALTH_URL:-https://api.seafurniture.am/api/health}"
SITE_URL="${SITE_URL:-https://seafurniture.am}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REMOTE_SCRIPT="deploy/hosting/remote-release.sh"

say()  { printf '\033[1;36m→\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✔\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# Connection reuse: one SSH handshake for the whole deploy
SOCK_DIR="$(mktemp -d)"
trap 'ssh -o ControlPath="$SOCK_DIR/s" -O exit "$SSH_HOST" >/dev/null 2>&1 || true; rm -rf "$SOCK_DIR"' EXIT
SSH_OPTS=(-o ControlMaster=auto -o ControlPath="$SOCK_DIR/s" -o ControlPersist=120 -o BatchMode=yes -o ConnectTimeout=15)

# remote <action> <args...>  — runs remote-release.sh on the server
remote() { ssh "${SSH_OPTS[@]}" "$SSH_HOST" "bash -s -- $*" < "$REMOTE_SCRIPT"; }
upload() { scp -q "${SSH_OPTS[@]}" "$1" "$SSH_HOST:$2"; }
home() { ssh "${SSH_OPTS[@]}" "$SSH_HOST" 'printf %s "$HOME"'; }

wait_http() {  # wait_http <url> <label> [must-contain]
  local i code body; body="$(mktemp)"
  for i in $(seq 1 20); do
    code="$(curl -sS -o "$body" -w '%{http_code}' --max-time 30 "$1" 2>/dev/null || echo 000)"
    if [ "$code" = 200 ] && { [ -z "${3:-}" ] || grep -q "$3" "$body"; }; then rm -f "$body"; ok "$2 → 200"; return 0; fi
    sleep 4
  done
  rm -f "$body"; warn "$2 → HTTP $code ($1)"; return 1
}

check_access() {
  say "Checking SSH ($SSH_HOST)"
  ssh "${SSH_OPTS[@]}" "$SSH_HOST" "test -d ~/$API_APP && test -d ~/$WEB_APP && test -f ~/nodevenv/$API_APP/22/bin/activate" \
    || die "SSH failed or app folders missing. Test manually: ssh $SSH_HOST"
  ok "SSH works, both apps found"
}

ask_rollback() {  # ask_rollback <app> <kind> <label>
  printf '\n%s-ը չի պատասխանում։ Վերադարձնե՞լ նախորդ տարբերակը [y/N] ' "$3"
  local a; read -r a
  if [ "$a" = y ] || [ "$a" = Y ]; then
    remote rollback "\"$REMOTE_HOME/$1\"" "$2" </dev/null && remote restart "\"$REMOTE_HOME/$1\"" "$1" </dev/null
    ok "$3 rolled back (failed release kept in ~/$1/.deploy_failed)"
  else
    warn "Left as is. Error log: ~/$1/stderr.log  (ssh $SSH_HOST tail -50 $1/stderr.log)"
  fi
  exit 1
}

# install_release <app> <kind> <zip>  → prints remote flags
install_release() {
  local app="$1" kind="$2" zip="$3" dir="$REMOTE_HOME/$1"
  say "Uploading $(basename "$zip") ($(du -h "$zip" | cut -f1))"
  upload "$zip" "$dir/.deploy_upload.zip"
  say "Swapping release (previous kept in ~/$app/.deploy_prev)"
  remote install "\"$dir\"" "\"$dir/.deploy_upload.zip\"" "$kind" </dev/null
}

migrate() {
  local dir="$REMOTE_HOME/$API_APP" pw=""
  if ! ssh "${SSH_OPTS[@]}" "$SSH_HOST" "grep -qs '^DB_PASSWORD=.' ~/$API_APP/.env"; then
    read -r -s -p "DB password (etbgahjl_seauser): " pw; echo
  fi
  # Script + password go through stdin only (never on a command line or in a file):
  # the server copies the first N bytes (the script) to a temp file, the rest (password) feeds its `read`
  ssh "${SSH_OPTS[@]}" "$SSH_HOST" "f=\$(mktemp) && trap 'rm -f \$f' EXIT && head -c $(wc -c < "$REMOTE_SCRIPT" | tr -d " ") > \$f && bash \$f migrate \"$dir\" $API_APP" \
    < <(cat "$REMOTE_SCRIPT"; printf '%s\n' "$pw")
}

deploy_backend() {
  [ -f deploy/backend.zip ] || die "deploy/backend.zip not found"
  echo; say "BACKEND"
  local out; out="$(install_release "$API_APP" api deploy/backend.zip)" || die "Release install failed: $out"
  printf '%s\n' "$out" | grep -v '^NEED_\|^SWAPPED' || true
  if printf '%s\n' "$out" | grep -q '^NEED_NPM=1'; then
    say "Dependencies changed → npm install (1–3 min)"
    remote npm "\"$REMOTE_HOME/$API_APP\"" "$API_APP" </dev/null || ask_rollback "$API_APP" api "API"
  fi
  if printf '%s\n' "$out" | grep -q '^NEED_MIGRATE=1'; then
    say "New database migrations → migrate deploy"
    migrate || ask_rollback "$API_APP" api "API"
  fi
  say "Restarting API"
  remote restart "\"$REMOTE_HOME/$API_APP\"" "$API_APP" </dev/null
  wait_http "$API_HEALTH_URL" "API health" '"ok"' || ask_rollback "$API_APP" api "API"
}

deploy_frontend() {
  [ -f deploy/frontend.zip ] || die "deploy/frontend.zip not found"
  echo; say "FRONTEND"
  local out; out="$(install_release "$WEB_APP" web deploy/frontend.zip)" || die "Release install failed: $out"
  say "Restarting site"
  remote restart "\"$REMOTE_HOME/$WEB_APP\"" "$WEB_APP" </dev/null
  wait_http "$SITE_URL/" "Site" || ask_rollback "$WEB_APP" web "Site"
  wait_http "$SITE_URL/api/health" "Site → API proxy" '"ok"' || warn "The site is up but cannot reach the API"
}

# ─── Main ───
CMD="${1:-all}"
SKIP_BUILD=0
for a in "$@"; do if [ "$a" = --skip-build ]; then SKIP_BUILD=1; fi; done

case "$CMD" in
  check|rollback|all|frontend|backend) ;;
  *) die "usage: $0 [all|frontend|backend] [--skip-build] | rollback frontend|backend | check" ;;
esac

check_access
REMOTE_HOME="$(home)"
[ "$CMD" = check ] && exit 0

if [ "$CMD" = rollback ]; then
  case "${2:-}" in
    frontend) remote rollback "\"$REMOTE_HOME/$WEB_APP\"" web </dev/null; remote restart "\"$REMOTE_HOME/$WEB_APP\"" "$WEB_APP" </dev/null
              wait_http "$SITE_URL/" "Site" || true ;;
    backend)  remote rollback "\"$REMOTE_HOME/$API_APP\"" api </dev/null; remote restart "\"$REMOTE_HOME/$API_APP\"" "$API_APP" </dev/null
              wait_http "$API_HEALTH_URL" "API health" '"ok"' || true
              warn "If the rolled-back version needs other dependencies, run: bash deploy/deploy-hosting.sh backend --skip-build" ;;
    *) die "usage: $0 rollback frontend|backend" ;;
  esac
  exit 0
fi

if [ "$SKIP_BUILD" = 0 ]; then
  echo; say "Building ($CMD)"
  bash deploy/build-zips.sh "$CMD"
fi

# Backend first: the new site may rely on new API endpoints
if [ "$CMD" = all ] || [ "$CMD" = backend ]; then deploy_backend; fi
if [ "$CMD" = all ] || [ "$CMD" = frontend ]; then deploy_frontend; fi

echo; ok "Deploy finished: $SITE_URL"
