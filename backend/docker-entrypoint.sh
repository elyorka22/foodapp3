#!/bin/sh
set -e

if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

exec "$@"
