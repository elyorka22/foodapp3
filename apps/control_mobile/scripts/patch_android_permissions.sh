#!/usr/bin/env bash
# Ensures INTERNET permission after flutter create.
set -euo pipefail
MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/android/app/src/main/AndroidManifest.xml"
[[ -f "$MANIFEST" ]] || exit 0

python3 - "$MANIFEST" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()

required = ["android.permission.INTERNET"]
missing = [p for p in required if p not in text]
if not missing:
    print("AndroidManifest already has required permissions")
    sys.exit(0)

match = re.search(r"<manifest[^>]*>", text)
if not match:
    print("ERROR: could not find <manifest> opening tag")
    sys.exit(1)

lines = [f'    <uses-permission android:name="{p}"/>' for p in missing]
block = "\n" + "\n".join(lines) + "\n"
insert_at = match.end()
path.write_text(text[:insert_at] + block + text[insert_at:])
print("Patched AndroidManifest.xml:", ", ".join(missing))
PY
