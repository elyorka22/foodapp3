#!/usr/bin/env bash
# Configures Firebase / google-services for Android after `flutter create`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"
DEST="${ANDROID_DIR}/app/google-services.json"
APP_GRADLE="${ANDROID_DIR}/app/build.gradle.kts"
SETTINGS_GRADLE="${ANDROID_DIR}/settings.gradle.kts"
MANIFEST="${ANDROID_DIR}/app/src/main/AndroidManifest.xml"

if [[ ! -d "${ANDROID_DIR}" ]]; then
  echo "ERROR: ${ANDROID_DIR} not found — run flutter create first"
  exit 1
fi

REQUIRED_PACKAGE="com.foodapp.business_mobile"

validate_json() {
  python3 - "$1" <<'PY'
import json, sys
path = sys.argv[1]
try:
    with open(path, encoding="utf-8") as f:
        json.load(f)
    print(f"Valid JSON: {path}")
except json.JSONDecodeError as exc:
    print(f"ERROR: invalid JSON in {path}: {exc}", file=sys.stderr)
    sys.exit(1)
PY
}

google_services_has_required_package() {
  python3 - "$1" "$REQUIRED_PACKAGE" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
required = sys.argv[2]
try:
    data = json.loads(path.read_text(encoding="utf-8"))
except json.JSONDecodeError:
    sys.exit(1)

packages = [
    c.get("client_info", {}).get("android_client_info", {}).get("package_name")
    for c in data.get("client", [])
]
packages = [p for p in packages if p]
if required in packages:
    sys.exit(0)
print(
    f"WARN: missing Android app {required}; found: {', '.join(packages) or '(none)'}",
    file=sys.stderr,
)
sys.exit(1)
PY
}

decode_b64_google_services() {
  printf '%s' "${GOOGLE_SERVICES_JSON_B64}" | tr -d '\n\r' | base64 --decode
}

write_raw_google_services() {
  printf '%s' "${GOOGLE_SERVICES_JSON}"
}

copy_local_google_services() {
  cat "${ROOT}/google-services.json"
}

copy_example_google_services() {
  cat "${ROOT}/google-services.json.example"
}

try_google_services_source() {
  local label="$1"
  shift
  if ! "$@" > "$DEST"; then
    echo "WARN: ${label} could not be read"
    return 1
  fi
  if ! validate_json "$DEST" >/dev/null 2>&1; then
    echo "WARN: ${label} is not valid JSON"
    return 1
  fi
  if ! google_services_has_required_package "$DEST"; then
    return 1
  fi
  validate_json "$DEST"
  echo "Wrote google-services.json from ${label}"
  return 0
}

write_google_services() {
  mkdir -p "$(dirname "$DEST")"

  if [[ -n "${GOOGLE_SERVICES_JSON_B64:-}" ]]; then
    if try_google_services_source "GOOGLE_SERVICES_JSON_B64" decode_b64_google_services; then
      return 0
    fi
    echo "WARN: GOOGLE_SERVICES_JSON_B64 ignored — re-encode with:"
    echo "  base64 -i google-services.json | tr -d '\\n'"
  fi

  if [[ -n "${GOOGLE_SERVICES_JSON:-}" ]]; then
    if try_google_services_source "GOOGLE_SERVICES_JSON" write_raw_google_services; then
      return 0
    fi
    echo "WARN: GOOGLE_SERVICES_JSON ignored — must include ${REQUIRED_PACKAGE}"
  fi

  if [[ -f "${ROOT}/google-services.json" ]]; then
    if try_google_services_source "local google-services.json" copy_local_google_services; then
      return 0
    fi
  fi

  if [[ -f "${ROOT}/google-services.json.example" ]]; then
    if try_google_services_source "google-services.json.example" copy_example_google_services; then
      return 0
    fi
  fi

  echo "ERROR: no google-services.json source contains ${REQUIRED_PACKAGE}" >&2
  echo "Download Firebase config for package ${REQUIRED_PACKAGE} and update GOOGLE_SERVICES_JSON_BUSINESS_B64." >&2
  exit 1
}

write_google_services

python3 - "${DEST}" "$REQUIRED_PACKAGE" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
package = sys.argv[2]
data = json.loads(path.read_text(encoding="utf-8"))
client = next(
    (
        c
        for c in data.get("client", [])
        if c.get("client_info", {}).get("android_client_info", {}).get("package_name") == package
    ),
    None,
)
app_id = client.get("client_info", {}).get("mobilesdk_app_id", "")
print(f"OK: Firebase Android app for {package} ({app_id})")
PY

python3 - "${SETTINGS_GRADLE}" "${APP_GRADLE}" "${MANIFEST}" <<'PY'
import re
import sys
from pathlib import Path

settings_path, app_path, manifest_path = map(Path, sys.argv[1:4])

GSV = '4.4.2'
settings = settings_path.read_text()
if 'com.google.gms.google-services' not in settings:
    if 'plugins {' in settings:
        settings = settings.replace(
            'plugins {',
            f'plugins {{\n    id("com.google.gms.google-services") version "{GSV}" apply false',
            1,
        )
    else:
        settings += f'\nplugins {{\n    id("com.google.gms.google-services") version "{GSV}" apply false\n}}\n'
    settings_path.write_text(settings)
    print('Patched settings.gradle.kts: google-services plugin')

app = app_path.read_text()
if 'com.google.gms.google-services' not in app:
    if 'plugins {' in app:
        app = app.replace(
            'plugins {',
            'plugins {\n    id("com.google.gms.google-services")',
            1,
        )
    else:
        app = 'plugins {\n    id("com.google.gms.google-services")\n}\n' + app
    app_path.write_text(app)
    print('Patched app/build.gradle.kts: google-services plugin')

if 'isCoreLibraryDesugaringEnabled' not in app:
    if 'compileOptions {' in app:
        app = app.replace(
            'compileOptions {',
            'compileOptions {\n        isCoreLibraryDesugaringEnabled = true',
            1,
        )
        print('Patched app/build.gradle.kts: core library desugaring enabled')

if 'multiDexEnabled' not in app and 'defaultConfig {' in app:
    app = app.replace(
        'defaultConfig {',
        'defaultConfig {\n        multiDexEnabled = true',
        1,
    )
    print('Patched app/build.gradle.kts: multiDexEnabled')

if 'coreLibraryDesugaring' not in app:
    app = app.rstrip() + (
        '\n\ndependencies {\n'
        '    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")\n'
        '}\n'
    )
    print('Patched app/build.gradle.kts: desugar_jdk_libs dependency')

app_path.write_text(app)

manifest = manifest_path.read_text()
required_perms = [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.INTERNET',
    'android.permission.WAKE_LOCK',
    'android.permission.VIBRATE',
]
missing = [p for p in required_perms if p not in manifest]
if missing:
    match = re.search(r'<manifest[^>]*>', manifest)
    if match:
        block = '\n' + '\n'.join(f'    <uses-permission android:name="{p}"/>' for p in missing) + '\n'
        manifest = manifest[: match.end()] + block + manifest[match.end() :]
        print('Patched AndroidManifest permissions:', ', '.join(missing))

fcm_meta = '''        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="foodapp_business_default" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />'''

if 'com.google.firebase.messaging.default_notification_channel_id' not in manifest:
    app_match = re.search(r'<application[^>]*>', manifest)
    if app_match:
        manifest = (
            manifest[: app_match.end()]
            + '\n'
            + fcm_meta
            + '\n'
            + manifest[app_match.end() :]
        )
        print('Patched AndroidManifest: FCM default notification channel')

manifest_path.write_text(manifest)
PY

echo "Firebase Android setup complete"
