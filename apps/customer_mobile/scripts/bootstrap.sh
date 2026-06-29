#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter SDK not found. Install: https://docs.flutter.dev/get-started/install"
  exit 1
fi

# Generate platform folders if missing (android / ios)
if [[ ! -f android/app/build.gradle.kts && ! -f android/app/build.gradle ]]; then
  echo "Creating Flutter platform projects..."
  flutter create . --org com.foodapp --project-name customer_mobile --platforms=android,ios
fi

flutter pub get
chmod +x scripts/patch_android_permissions.sh scripts/patch_android_app_name.sh scripts/patch_android_edge_to_edge.sh 2>/dev/null || true
./scripts/patch_android_permissions.sh 2>/dev/null || true
./scripts/patch_android_app_name.sh 2>/dev/null || true
./scripts/patch_android_edge_to_edge.sh 2>/dev/null || true
dart run build_runner build --delete-conflicting-outputs 2>/dev/null || true

echo "Done. Emulator example:"
echo "  flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1 --dart-define=WS_BASE_URL=http://10.0.2.2:4000"
echo "Release requires production URLs (no 10.0.2.2 in release mode)."
