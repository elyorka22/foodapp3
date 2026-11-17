#!/usr/bin/env bash
# After `flutter create --platforms=android`, harden SharedPreferences / release packaging
# and work around Android Lint crashes on plugin modules (e.g. image_picker CommentDetector).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_GRADLE="$ROOT/android/app/build.gradle"
ROOT_GRADLE="$ROOT/android/build.gradle"
PROGUARD="$ROOT/android/app/proguard-rules.pro"

[[ -f "$APP_GRADLE" ]] || exit 0

mkdir -p "$(dirname "$PROGUARD")"
cat >"$PROGUARD" <<'EOF'
# Keep shared_preferences Pigeon / plugin classes (release channel mismatches).
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-keep class com.google.common.util.concurrent.** { *; }
EOF

python3 - "$APP_GRADLE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
changed = False

needle = "signingConfig = signingConfigs.debug"
rule = "proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'"
if rule not in text and needle in text:
    text = text.replace(
        needle,
        needle + "\n            " + rule,
        1,
    )
    changed = True
    print("Patched android/app/build.gradle with proguardFiles")
elif rule in text:
    print("build.gradle already has proguardFiles")
else:
    print("WARNING: could not find release signingConfig line to patch")

lint_block = """
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
"""
if "checkReleaseBuilds false" not in text and "android {" in text:
    text = text.replace("android {", "android {" + lint_block, 1)
    changed = True
    print("Patched android/app/build.gradle with lint checkReleaseBuilds=false")
elif "checkReleaseBuilds false" in text:
    print("build.gradle already disables checkReleaseBuilds")

if changed:
    path.write_text(text)
PY

if [[ -f "$ROOT_GRADLE" ]]; then
  python3 - "$ROOT_GRADLE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
marker = "Disable lintVitalAnalyzeRelease for Flutter plugins"
if marker in text:
    print("android/build.gradle already has lintVital workaround")
    raise SystemExit(0)

snippet = """
// Disable lintVitalAnalyzeRelease for Flutter plugins
// (image_picker_android lint crash: CommentDetector / List.removeLast on older JDKs).
subprojects { subproject ->
    subproject.tasks.configureEach { task ->
        if (task.name == "lintVitalAnalyzeRelease") {
            task.enabled = false
        }
    }
}
"""
path.write_text(text.rstrip() + "\n" + snippet)
print("Patched android/build.gradle to disable lintVitalAnalyzeRelease")
PY
fi
