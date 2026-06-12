#!/usr/bin/env bash
set -euo pipefail

API_URL="$(printf '%s' "${API_BASE_URL:-}" | tr -d '[:space:]')"

if [[ -z "$API_URL" ]]; then
  echo "ERROR: API_BASE_URL is required (GitHub secret or env)."
  exit 1
fi

forbidden='localhost|127\.0\.0\.1|10\.0\.2\.2'
if echo "$API_URL" | grep -qiE "$forbidden"; then
  echo "ERROR: API_BASE_URL must not use localhost, 127.0.0.1, or 10.0.2.2"
  exit 1
fi

if echo "$API_URL" | grep -qiE '/api/v1/api/v1'; then
  echo "ERROR: API_BASE_URL contains /api/v1 twice."
  exit 1
fi

if [[ "$API_URL" != */api/v1 ]]; then
  echo "WARN: API_BASE_URL should end with /api/v1 (got: $API_URL). App will append /api/v1 automatically."
fi

echo "Build env OK: API_BASE_URL=$API_URL"
