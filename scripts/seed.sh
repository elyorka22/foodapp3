#!/bin/sh
# Run database seed inside API container
set -e
cd "$(dirname "$0")/.."
docker compose exec api npx prisma db seed
