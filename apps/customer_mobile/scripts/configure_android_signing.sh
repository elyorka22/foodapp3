#!/usr/bin/env bash
# Optional release signing for CI. Requires GitHub secrets:
# ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"
APP_GRADLE="${ANDROID_DIR}/app/build.gradle.kts"
KEYSTORE_PATH="${ANDROID_DIR}/app/upload-keystore.jks"
KEY_PROPS="${ANDROID_DIR}/key.properties"

if [[ ! -d "${ANDROID_DIR}" ]]; then
  echo "SKIP: android/ not found"
  exit 0
fi

if [[ -z "${ANDROID_KEYSTORE_BASE64:-}" ]]; then
  echo "SKIP: ANDROID_KEYSTORE_BASE64 not set — release APK will use debug signing"
  exit 0
fi

for var in ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: ${var} is required when ANDROID_KEYSTORE_BASE64 is set"
    exit 1
  fi
done

printf '%s' "${ANDROID_KEYSTORE_BASE64}" | base64 --decode > "${KEYSTORE_PATH}"

cat > "${KEY_PROPS}" <<EOF
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyPassword=${ANDROID_KEY_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS}
storeFile=upload-keystore.jks
EOF

python3 - "${APP_GRADLE}" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()

if 'signingConfigs' in text:
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
            }
        }
    }
'''

release_patch = '''
        release {
            signingConfig = signingConfigs.getByName("release")
        }
'''

text = text.replace('android {', 'android {' + signing_block, 1)

if 'release {' in text and 'signingConfig = signingConfigs.getByName("release")' not in text:
    text = text.replace('release {', release_patch, 1)

path.write_text(text)
print('Configured release signing in app/build.gradle.kts')
PY

echo "Release keystore written to android/app/upload-keystore.jks"
