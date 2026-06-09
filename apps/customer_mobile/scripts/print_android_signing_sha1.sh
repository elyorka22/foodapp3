#!/usr/bin/env bash
# Prints SHA-1/SHA-256 for the configured release keystore or a signed APK.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"
KEY_PROPS="${ANDROID_DIR}/key.properties"
DEBUG_KEYSTORE="${HOME}/.android/debug.keystore"
APK_PATH="${1:-${ROOT}/build/app/outputs/flutter-apk/app-release.apk}"

print_with_keytool_keystore() {
  local keystore="$1"
  local alias="$2"
  local storepass="$3"
  keytool -list -v -keystore "$keystore" -alias "$alias" -storepass "$storepass" \
    | grep -E 'SHA1:|SHA256:'
}

print_with_openssl_p12() {
  local keystore="$1"
  local storepass="$2"
  local cert
  cert="$(openssl pkcs12 -in "$keystore" -clcerts -nokeys -passin "pass:${storepass}" 2>/dev/null | openssl x509)"
  echo "SHA1: $(echo "$cert" | openssl x509 -noout -fingerprint -sha1 | sed 's/sha1 Fingerprint=//i')"
  echo "SHA256: $(echo "$cert" | openssl x509 -noout -fingerprint -sha256 | sed 's/sha256 Fingerprint=//i')"
}

print_apk_cert() {
  local apk="$1"
  if [[ ! -f "$apk" ]]; then
    echo "APK not found: $apk" >&2
    return 1
  fi
  if command -v keytool >/dev/null 2>&1; then
    echo "Signed APK: $apk"
    keytool -printcert -jarfile "$apk" | grep -E 'SHA1:|SHA256:'
    return 0
  fi
  if command -v apksigner >/dev/null 2>&1; then
    echo "Signed APK: $apk"
    apksigner verify --print-certs "$apk" | grep -E 'SHA-1|SHA-256'
    return 0
  fi
  echo "WARN: keytool/apksigner not available to read APK certificate" >&2
  return 1
}

echo "=== Android signing certificate fingerprints ==="

if [[ -f "$APK_PATH" ]]; then
  print_apk_cert "$APK_PATH"
  exit 0
fi

if [[ -f "${KEY_PROPS}" ]]; then
  store_file="$(grep '^storeFile=' "${KEY_PROPS}" | cut -d= -f2-)"
  store_password="$(grep '^storePassword=' "${KEY_PROPS}" | cut -d= -f2-)"
  key_alias="$(grep '^keyAlias=' "${KEY_PROPS}" | cut -d= -f2-)"
  keystore="${ANDROID_DIR}/app/${store_file}"
  if [[ -f "${keystore}" ]]; then
    echo "Release keystore: ${keystore}"
    if command -v keytool >/dev/null 2>&1; then
      print_with_keytool_keystore "$keystore" "$key_alias" "$store_password"
    else
      print_with_openssl_p12 "$keystore" "$store_password"
    fi
    exit 0
  fi
fi

if [[ -f "${DEBUG_KEYSTORE}" ]]; then
  echo "Using default debug keystore: ${DEBUG_KEYSTORE}"
  if command -v keytool >/dev/null 2>&1; then
    keytool -list -v -keystore "${DEBUG_KEYSTORE}" -alias androiddebugkey -storepass android -keypass android \
      | grep -E 'SHA1:|SHA256:'
  else
    echo "WARN: keytool not available" >&2
    exit 1
  fi
  exit 0
fi

echo "WARN: no keystore or signed APK found to print fingerprints" >&2
exit 1
