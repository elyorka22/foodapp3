#!/usr/bin/env bash
# Generates Android/iOS launcher icons from assets/images/app_icon.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v dart >/dev/null 2>&1; then
  echo "Dart/Flutter SDK required"
  exit 1
fi

flutter pub get
dart run flutter_launcher_icons
echo "Launcher icons updated from assets/images/app_icon.png"
