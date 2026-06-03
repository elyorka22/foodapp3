#!/usr/bin/env bash
# Capture marketing/audit screenshots — requires Flutter SDK + running backend.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/screenshots"
mkdir -p "$OUT"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter SDK required. Install from https://docs.flutter.dev/get-started/install"
  exit 1
fi

cd "$ROOT"
flutter pub get

DEVICE="${DEVICE:-ios}"
flutter drive \
  --driver=test_driver/screenshot_driver.dart \
  --target=integration_test/screenshot_test.dart \
  -d "$DEVICE" \
  2>/dev/null || {
  echo "Fallback: run app manually and save frames to docs/screenshots/"
  echo "  splash.png restaurants.png restaurant_detail.png stores.png"
  echo "  store_detail.png cart.png checkout.png profile.png"
  flutter run -d "$DEVICE" \
    --dart-define=API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:4000/api/v1}" \
    --dart-define=TELEGRAM_BOT_USERNAME="${TELEGRAM_BOT_USERNAME:-}"
  exit 0
}

echo "Screenshots written to $OUT"
