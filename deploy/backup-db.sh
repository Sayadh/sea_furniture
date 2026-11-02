#!/usr/bin/env bash
# Daily MySQL/MariaDB + uploads backup (keep 14 days). Example cron:
#   15 3 * * * /var/www/sea_furniture/deploy/backup-db.sh >> /var/www/sea_furniture/logs/backup.log 2>&1
# Credentials: put them in ~/.my.cnf ([client] user=... password=...) instead of this file.
set -euo pipefail
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/sea_furniture}"
DB_NAME="${DB_NAME:-sea_furniture}"
UPLOAD_DIR="${UPLOAD_DIR:-/var/www/sea_uploads}"
STAMP="$(date +%Y%m%d_%H%M)"
mkdir -p "$BACKUP_DIR"
mysqldump --single-transaction --routines "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"
[ -d "$UPLOAD_DIR" ] && tar czf "$BACKUP_DIR/uploads_${STAMP}.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "$(date -Is) backup ok"
