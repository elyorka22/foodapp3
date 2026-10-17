#!/usr/bin/env bash
# After `flutter create --platforms=android`, harden SharedPreferences / release packaging.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE="$ROOT/android/app/build.gradle"
PROGUARD="$ROOT/android/app/proguard-rules.pro"

[[ -f "$GRADLE" ]] || exit 0

mkdir -p "$(dirname "$PROGUARD")"
cat >"$PROGUARD" <<'EOF'
# Keep shared_preferences Pigeon / plugin classes (release channel mismatches).
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-keep class com.google.common.util.concurrent.** { *; }
EOF

python3 - "$GRADLE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
needle = "signingConfig = signingConfigs.debug"
rule = "proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'"
if rule in text:
    print("build.gradle already has proguardFiles")
    raise SystemExit(0)
if needle not in text:
    print("WARNING: could not find release signingConfig line to patch")
    raise SystemExit(0)
text = text.replace(
    needle,
    needle + "\n            " + rule,
    1,
)
path.write_text(text)
print("Patched android/app/build.gradle with proguardFiles")
PY
