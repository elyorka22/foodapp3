#!/usr/bin/env bash
# Sets the Android launcher / app label shown under the icon.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="${ROOT}/android/app/src/main/AndroidManifest.xml"
STRINGS="${ROOT}/android/app/src/main/res/values/strings.xml"
APP_LABEL="iKuryer"

if [[ ! -f "${MANIFEST}" ]]; then
  echo "SKIP: AndroidManifest.xml not found"
  exit 0
fi

python3 - "${MANIFEST}" "${STRINGS}" "${APP_LABEL}" <<'PY'
import re
import sys
from pathlib import Path

manifest_path = Path(sys.argv[1])
strings_path = Path(sys.argv[2])
label = sys.argv[3]

text = manifest_path.read_text()
updated = text

if 'android:label=' in updated:
    updated = re.sub(
        r'android:label="[^"]*"',
        f'android:label="{label}"',
        updated,
        count=1,
    )
else:
    updated = updated.replace(
        '<application',
        f'<application\n        android:label="{label}"',
        1,
    )

if updated != text:
    manifest_path.write_text(updated)
    print(f"Patched AndroidManifest android:label={label}")
else:
    print("AndroidManifest label unchanged")

if strings_path.exists():
    strings = strings_path.read_text()
    if 'name="app_name"' in strings:
        new_strings = re.sub(
            r'(<string name="app_name">)[^<]*(</string>)',
            rf'\g<1>{label}\g<2>',
            strings,
            count=1,
        )
        if new_strings != strings:
            strings_path.write_text(new_strings)
            print(f"Patched strings.xml app_name={label}")
PY
