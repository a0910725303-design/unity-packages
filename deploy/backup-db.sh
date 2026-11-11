#!/usr/bin/env bash
# 每日資料庫備份，保留 14 天。
# 手動執行：bash deploy/backup-db.sh
# 自動排程（每天凌晨 3:30）：crontab -e 後加入一行
#   30 3 * * * /bin/bash /var/www/unity-packages/deploy/backup-db.sh >> /var/log/unity-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

# 從 .env 讀取資料庫設定
set -a; . ./.env; set +a
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/${DB_NAME}-$(date +%Y%m%d-%H%M).sql.gz"

MYSQL_PWD="$DB_PASSWORD" mysqldump \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" \
  --single-transaction --no-tablespaces --default-character-set=utf8mb4 \
  --ignore-table="${DB_NAME}.sessions" \
  "$DB_NAME" | gzip > "$FILE"

find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -mtime +14 -delete
echo "$(date '+%F %T') 備份完成：$FILE"
