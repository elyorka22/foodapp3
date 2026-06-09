#!/usr/bin/env bash
# Generates a PKCS12 release keystore for CI signing (OpenSSL only).
# Output: .secrets/upload-keystore.p12 and .secrets/github-secrets.txt (gitignored)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS_DIR="${ROOT}/.secrets"
KEYSTORE_PATH="${SECRETS_DIR}/upload-keystore.p12"
KEY_PATH="${SECRETS_DIR}/release.key"
CRT_PATH="${SECRETS_DIR}/release.crt"
OUT_FILE="${SECRETS_DIR}/github-secrets.txt"
ALIAS="${ANDROID_KEY_ALIAS:-foodapp-customer-release}"
STORE_PASS="${ANDROID_KEYSTORE_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20)}"
KEY_PASS="${ANDROID_KEY_PASSWORD:-$STORE_PASS}"

mkdir -p "$SECRETS_DIR"

openssl genrsa -out "$KEY_PATH" 2048
openssl req -new -x509 -key "$KEY_PATH" -out "$CRT_PATH" -days 3650 \
  -subj "/CN=FoodApp Customer/O=FoodApp/C=UZ"
openssl pkcs12 -export \
  -inkey "$KEY_PATH" \
  -in "$CRT_PATH" \
  -out "$KEYSTORE_PATH" \
  -name "$ALIAS" \
  -passout "pass:${STORE_PASS}"

B64="$(base64 -i "$KEYSTORE_PATH" | tr -d '\n')"
SHA1="$(openssl x509 -in "$CRT_PATH" -noout -fingerprint -sha1 | sed 's/sha1 Fingerprint=//i')"
SHA256="$(openssl x509 -in "$CRT_PATH" -noout -fingerprint -sha256 | sed 's/sha256 Fingerprint=//i')"

cat > "$OUT_FILE" <<EOF
ANDROID_KEYSTORE_PASSWORD=${STORE_PASS}
ANDROID_KEY_ALIAS=${ALIAS}
ANDROID_KEY_PASSWORD=${KEY_PASS}
ANDROID_KEYSTORE_BASE64=${B64}
EOF

chmod 600 "$OUT_FILE" "$KEYSTORE_PATH" "$KEY_PATH" "$CRT_PATH"

echo "Keystore: ${KEYSTORE_PATH}"
echo "Secrets file: ${OUT_FILE}"
echo "ANDROID_KEY_ALIAS=${ALIAS}"
echo "ANDROID_KEYSTORE_PASSWORD=${STORE_PASS}"
echo "ANDROID_KEY_PASSWORD=${KEY_PASS}"
echo "SHA1=${SHA1}"
echo "SHA256=${SHA256}"
echo ""
echo "Add SHA-1 and SHA-256 to Firebase Console → com.foodapp.customer_mobile"
echo "Then copy values from ${OUT_FILE} into GitHub repository secrets."
