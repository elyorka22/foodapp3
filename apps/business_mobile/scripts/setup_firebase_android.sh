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

write_google_services() {
  mkdir -p "$(dirname "$DEST")"

  if [[ -n "${GOOGLE_SERVICES_JSON_B64:-}" ]]; then
    printf '%s' "${GOOGLE_SERVICES_JSON_B64}" | base64 --decode > "$DEST"
    if validate_json "$DEST"; then
      echo "Wrote google-services.json from GOOGLE_SERVICES_JSON_B64"
      return 0
    fi
    echo "WARN: GOOGLE_SERVICES_JSON_B64 decoded to invalid JSON"
  fi

  if [[ -n "${GOOGLE_SERVICES_JSON:-}" ]]; then
    printf '%s' "${GOOGLE_SERVICES_JSON}" > "$DEST"
    if validate_json "$DEST"; then
      echo "Wrote google-services.json from GOOGLE_SERVICES_JSON"
      return 0
    fi
    echo "WARN: GOOGLE_SERVICES_JSON is malformed"
  fi

  if [[ -f "${ROOT}/google-services.json" ]]; then
    cp "${ROOT}/google-services.json" "$DEST"
    if validate_json "$DEST"; then
      echo "Copied google-services.json → android/app/"
      return 0
    fi
    echo "WARN: local google-services.json is invalid"
  fi

  if [[ -f "${ROOT}/google-services.json.example" ]]; then
    cp "${ROOT}/google-services.json.example" "$DEST"
    validate_json "$DEST"
    echo "Using google-services.json.example → android/app/"
    return 0
  fi

  echo "ERROR: no valid google-services.json source found" >&2
  exit 1
}

write_google_services

python3 - "${DEST}" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text())
package = "com.foodapp.business_mobile"
client = next(
    (
        c
        for c in data.get("client", [])
        if c.get("client_info", {}).get("android_client_info", {}).get("package_name") == package
    ),
    None,
)
if client is None:
    print(f"ERROR: google-services.json has no Android app for {package}", file=sys.stderr)
    sys.exit(1)

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
