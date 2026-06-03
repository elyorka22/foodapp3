#!/usr/bin/env bash
# Adds location permissions after flutter create.
set -euo pipefail
MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/android/app/src/main/AndroidManifest.xml"
[[ -f "$MANIFEST" ]] || exit 0

if ! grep -q 'ACCESS_FINE_LOCATION' "$MANIFEST"; then
  sed -i.bak '/<manifest/a\
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
' "$MANIFEST" 2>/dev/null || python3 - <<PY
from pathlib import Path
p = Path("$MANIFEST")
text = p.read_text()
perms = '''    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
'''
if 'ACCESS_FINE_LOCATION' not in text:
    text = text.replace('<manifest', '<manifest\n' + perms, 1)
    p.write_text(text)
PY
  echo "Patched Android location permissions"
fi
