#!/bin/sh
# Remove orphaned failed Prisma migration rows (P3009 loop on API start).
# Usage: ./scripts/db-fix-failed-migration.sh [migration_name]
set -eu

MIGRATION_NAME="${1:-20250607180000_guest_device_push}"

echo "Checking _prisma_migrations for ${MIGRATION_NAME}..."
docker compose exec postgres psql -U foodapp -d foodapp -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at FROM _prisma_migrations WHERE migration_name = '${MIGRATION_NAME}' ORDER BY started_at;"

echo "Deleting failed rows (finished_at IS NULL)..."
docker compose exec postgres psql -U foodapp -d foodapp -c \
  "DELETE FROM _prisma_migrations WHERE migration_name = '${MIGRATION_NAME}' AND finished_at IS NULL;"

echo "Remaining rows:"
docker compose exec postgres psql -U foodapp -d foodapp -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at FROM _prisma_migrations WHERE migration_name = '${MIGRATION_NAME}' ORDER BY started_at;"

echo "Done. Restart API: docker compose up -d api"
