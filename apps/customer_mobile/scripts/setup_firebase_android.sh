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

ci_secret_help() {
  cat >&2 <<'EOF'
ERROR: google-services.json was not loaded from GitHub secrets.

Set ONE of these repository secrets:
  • GOOGLE_SERVICES_JSON_CUSTOMER_B64  — recommended (base64-encoded file)
  • GOOGLE_SERVICES_JSON_CUSTOMER      — raw single-line JSON

Encode for B64 secret:
  base64 -i google-services.json | tr -d '\n'

Do NOT paste raw JSON into GOOGLE_SERVICES_JSON_CUSTOMER_B64.
EOF
}

write_google_services() {
  mkdir -p "$(dirname "$DEST")"
  local source=""

  # Option 1: base64-encoded secret (recommended for GitHub Actions)
  if [[ -n "${GOOGLE_SERVICES_JSON_B64:-}" ]]; then
    if [[ "${GOOGLE_SERVICES_JSON_B64:0:1}" == "{" ]]; then
      echo "ERROR: GOOGLE_SERVICES_JSON_CUSTOMER_B64 looks like raw JSON, not base64." >&2
      echo "Use: base64 -i google-services.json | tr -d '\\n'" >&2
      if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
        exit 1
      fi
    else
      if printf '%s' "${GOOGLE_SERVICES_JSON_B64}" | tr -d '[:space:]' | base64 --decode > "$DEST" 2>/dev/null \
        && validate_json "$DEST"; then
        source="GOOGLE_SERVICES_JSON_CUSTOMER_B64"
      else
        echo "WARN: GOOGLE_SERVICES_JSON_B64 could not be decoded to valid JSON" >&2
        rm -f "$DEST"
      fi
    fi
  fi

  # Option 2: raw JSON env var
  if [[ -z "$source" && -n "${GOOGLE_SERVICES_JSON:-}" ]]; then
    printf '%s' "${GOOGLE_SERVICES_JSON}" > "$DEST"
    if validate_json "$DEST"; then
      source="GOOGLE_SERVICES_JSON_CUSTOMER"
    else
      echo "WARN: GOOGLE_SERVICES_JSON is malformed (use a single-line JSON string)" >&2
      rm -f "$DEST"
    fi
  fi

  # Option 3: local file (dev, gitignored)
  if [[ -z "$source" && -f "${ROOT}/google-services.json" ]]; then
    cp "${ROOT}/google-services.json" "$DEST"
    if validate_json "$DEST"; then
      source="local google-services.json"
    else
      echo "WARN: local google-services.json is invalid" >&2
      rm -f "$DEST"
    fi
  fi

  # Option 4: committed example (local dev only — not for CI)
  if [[ -z "$source" && "${GITHUB_ACTIONS:-}" != "true" && -f "${ROOT}/google-services.json.example" ]]; then
    cp "${ROOT}/google-services.json.example" "$DEST"
    validate_json "$DEST"
    source="google-services.json.example"
  fi

  if [[ -z "$source" ]]; then
    if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
      ci_secret_help
    else
      echo "ERROR: no valid google-services.json source found" >&2
    fi
    exit 1
  fi

  echo "Wrote ${DEST} from ${source}"
}

write_google_services

python3 - "${DEST}" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text())
package = "com.foodapp.customer_mobile"
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

oauth = client.get("oauth_client", [])
android_oauth = [
    o for o in oauth if o.get("client_type") == 1 and o.get("android_info", {}).get("certificate_hash")
]
if not android_oauth:
    print(
        "ERROR: google-services.json is missing Android OAuth client (SHA-1).\n"
        "Firebase Console → Project settings → com.foodapp.customer_mobile → Add SHA-1,\n"
        "then download a fresh google-services.json and update GOOGLE_SERVICES_JSON_CUSTOMER_B64.",
        file=sys.stderr,
    )
    sys.exit(1)

print(f"OK: Android OAuth client found for {package} ({len(android_oauth)} SHA-1 entries)")
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

# flutter_local_notifications requires core library desugaring (Gradle kts)
if 'isCoreLibraryDesugaringEnabled' not in app:
    if 'compileOptions {' in app:
        app = app.replace(
            'compileOptions {',
            'compileOptions {\n        isCoreLibraryDesugaringEnabled = true',
            1,
        )
        print('Patched app/build.gradle.kts: core library desugaring enabled')
    else:
        print('WARN: compileOptions block not found — desugaring not patched')

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
            android:value="foodapp_default" />
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
