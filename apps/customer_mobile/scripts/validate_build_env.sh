#!/usr/bin/env bash
# Validates dart-define inputs for CI / release APK (no Firebase required).
set -euo pipefail

API_URL="${API_BASE_URL:-}"
WS_URL="${WS_BASE_URL:-}"

if [[ -z "$API_URL" ]]; then
  echo "ERROR: API_BASE_URL is required (GitHub secret or env)."
  exit 1
fi

if [[ -z "$WS_URL" ]]; then
  echo "ERROR: WS_BASE_URL is required (GitHub secret or env)."
  exit 1
fi

forbidden='localhost|127\.0\.0\.1|10\.0\.2\.2'
if echo "$API_URL" | grep -qiE "$forbidden"; then
  echo "ERROR: API_BASE_URL must not use localhost, 127.0.0.1, or 10.0.2.2"
  exit 1
fi

if echo "$WS_URL" | grep -qiE "$forbidden"; then
  echo "ERROR: WS_BASE_URL must not use localhost, 127.0.0.1, or 10.0.2.2"
  exit 1
fi

echo "Build env OK: API_BASE_URL and WS_BASE_URL validated"
