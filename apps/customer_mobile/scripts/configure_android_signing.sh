#!/usr/bin/env bash
# Configures release signing for CI from GitHub secrets.
# Requires: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"
APP_GRADLE="${ANDROID_DIR}/app/build.gradle.kts"
KEYSTORE_PATH="${ANDROID_DIR}/app/upload-keystore.p12"
KEY_PROPS="${ANDROID_DIR}/key.properties"

if [[ ! -d "${ANDROID_DIR}" ]]; then
  echo "ERROR: ${ANDROID_DIR} not found — run flutter create first" >&2
  exit 1
fi

if [[ -z "${ANDROID_KEYSTORE_BASE64:-}" ]]; then
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "ERROR: ANDROID_KEYSTORE_BASE64 secret is required for release APK signing." >&2
    echo "Generate a keystore with scripts/generate_release_keystore.sh and add GitHub secrets." >&2
    exit 1
  fi
  echo "SKIP: ANDROID_KEYSTORE_BASE64 not set — local release builds will use debug signing"
  exit 0
fi

for var in ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: ${var} is required when ANDROID_KEYSTORE_BASE64 is set" >&2
    exit 1
  fi
done

printf '%s' "${ANDROID_KEYSTORE_BASE64}" | tr -d '[:space:]' | base64 --decode > "${KEYSTORE_PATH}"

cat > "${KEY_PROPS}" <<EOF
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyPassword=${ANDROID_KEY_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS}
storeFile=upload-keystore.p12
storeType=PKCS12
EOF

python3 - "${APP_GRADLE}" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()

RELEASE_SIGNING = 'signingConfig = signingConfigs.getByName("release")'
DEBUG_SIGNING = 'signingConfig = signingConfigs.getByName("debug")'
KEYSTORE_MARKER = 'keystorePropertiesFile'

if RELEASE_SIGNING in text and KEYSTORE_MARKER in text:
    print('Release signing already configured')
    sys.exit(0)

if 'android {' not in text:
    print('ERROR: android block not found in build.gradle.kts', file=sys.stderr)
    sys.exit(1)

signing_block = '''
    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("key.properties")
            val keystoreProperties = java.util.Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                storeType = keystoreProperties.getProperty("storeType") ?: "jks"
            }
        }
    }

'''

if KEYSTORE_MARKER not in text:
    if '    buildTypes {' in text:
        text = text.replace('    buildTypes {', signing_block + '    buildTypes {', 1)
    else:
        text = text.replace('android {', 'android {' + signing_block, 1)

if DEBUG_SIGNING in text:
    text = text.replace(DEBUG_SIGNING, RELEASE_SIGNING, 1)
elif RELEASE_SIGNING not in text and 'release {' in text:
    text = text.replace(
        'release {',
        'release {\n            signingConfig = signingConfigs.getByName("release")',
        1,
    )

path.write_text(text)
print('Configured release signing in app/build.gradle.kts')
PY

echo "Release keystore written to android/app/upload-keystore.p12"
