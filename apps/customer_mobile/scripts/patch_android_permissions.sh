#!/usr/bin/env bash
# Ensures INTERNET + location permissions after flutter create.
set -euo pipefail
MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/android/app/src/main/AndroidManifest.xml"
[[ -f "$MANIFEST" ]] || exit 0

python3 - <<PY
from pathlib import Path

p = Path("$MANIFEST")
text = p.read_text()
changed = False

perms = [
    '    <uses-permission android:name="android.permission.INTERNET"/>',
    '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>',
    '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>',
]

for perm in perms:
    key = perm.split('android.permission.')[1].split('"')[0]
    if key not in text:
        text = text.replace('<manifest', '<manifest\n' + perm, 1)
        changed = True
        print(f"Added {key}")

if changed:
    p.write_text(text)
    print("Patched AndroidManifest.xml")
else:
    print("AndroidManifest already has required permissions")
PY
