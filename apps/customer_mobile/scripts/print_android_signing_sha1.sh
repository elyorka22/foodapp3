#!/usr/bin/env bash
# Prints SHA-1/SHA-256 for the keystore used to sign release APK builds.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"
KEY_PROPS="${ANDROID_DIR}/key.properties"
DEBUG_KEYSTORE="${HOME}/.android/debug.keystore"

echo "=== Android signing certificate fingerprints ==="

if [[ -f "${KEY_PROPS}" ]]; then
  store_file="$(grep '^storeFile=' "${KEY_PROPS}" | cut -d= -f2-)"
  store_password="$(grep '^storePassword=' "${KEY_PROPS}" | cut -d= -f2-)"
  key_alias="$(grep '^keyAlias=' "${KEY_PROPS}" | cut -d= -f2-)"
  keystore="${ANDROID_DIR}/app/${store_file}"
  if [[ -f "${keystore}" ]]; then
    echo "Release keystore: ${keystore}"
    keytool -list -v -keystore "${keystore}" -alias "${key_alias}" -storepass "${store_password}" \
      | grep -E 'SHA1:|SHA256:'
    exit 0
  fi
fi

if [[ -f "${DEBUG_KEYSTORE}" ]]; then
  echo "Using default debug keystore: ${DEBUG_KEYSTORE}"
  keytool -list -v -keystore "${DEBUG_KEYSTORE}" -alias androiddebugkey -storepass android -keypass android \
    | grep -E 'SHA1:|SHA256:'
  echo ""
  echo "Add SHA-1 above to Firebase Console → Project settings → Your apps → com.foodapp.customer_mobile"
  exit 0
fi

echo "WARN: no keystore found to print fingerprints"
