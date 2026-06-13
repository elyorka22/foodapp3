#!/usr/bin/env bash
# Ensures INTERNET + location permissions after flutter create.
set -euo pipefail
MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/android/app/src/main/AndroidManifest.xml"
[[ -f "$MANIFEST" ]] || exit 0

python3 - "$MANIFEST" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()

required = [
    "android.permission.INTERNET",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.USE_FULL_SCREEN_INTENT",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
]

missing = [p for p in required if p not in text]
if not missing:
    print("AndroidManifest already has required permissions")
else:
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

python3 - "$MANIFEST" <<'PY2'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()

if "<queries>" in text:
    print("AndroidManifest already has <queries>")
    sys.exit(0)

queries = """
    <queries>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="geo" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="google.navigation" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="yandexmaps" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="yandexnavi" />
        </intent>
        <package android:name="com.google.android.apps.maps" />
        <package android:name="ru.yandex.yandexnavi" />
        <package android:name="ru.yandex.yandexmaps" />
    </queries>
"""

app_match = re.search(r"\s*<application\b", text)
if not app_match:
    print("ERROR: could not find <application> tag")
    sys.exit(1)

path.write_text(text[:app_match.start()] + queries + text[app_match.start():])
print("Patched AndroidManifest.xml: added map navigation <queries>")
PY2
