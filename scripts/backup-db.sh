#!/bin/sh
# Daily PostgreSQL backup — add to cron: 0 3 * * * /opt/foodapp/scripts/backup-db.sh
set -e
BACKUP_DIR="${BACKUP_DIR:-/var/backups/foodapp}"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/foodapp_$(date +%Y%m%d_%H%M%S).sql.gz"
docker compose -f /opt/foodapp/docker-compose.yml exec -T postgres \
  pg_dump -U foodapp foodapp | gzip > "$FILE"
find "$BACKUP_DIR" -name '*.sql.gz' -mtime +14 -delete
echo "Backup saved: $FILE"
