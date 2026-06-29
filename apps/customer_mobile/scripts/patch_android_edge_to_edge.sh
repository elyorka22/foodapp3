#!/usr/bin/env bash
# Enables Android 15 edge-to-edge after `flutter create` (CI / bootstrap).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT}/android"

if [[ ! -d "${ANDROID_DIR}/app" ]]; then
  echo "patch_android_edge_to_edge: android/ not found — skip"
  exit 0
fi

python3 - "$ROOT" <<'PY'
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
android = root / "android"

# --- MainActivity.kt ---
main_activities = list(android.glob("app/src/main/kotlin/**/MainActivity.kt"))
if not main_activities:
    print("WARN: MainActivity.kt not found")
else:
    for path in main_activities:
        text = path.read_text()
        if "setDecorFitsSystemWindows" in text:
            print(f"MainActivity already patched: {path}")
            continue

        pkg_match = re.search(r"^package\s+(.+)\s*$", text, re.MULTILINE)
        package = pkg_match.group(1).strip() if pkg_match else "com.foodapp.customer_mobile"
        # FlutterActivity extends Activity, not ComponentActivity — enableEdgeToEdge() does not apply.
        patched = f"""package {package}

import android.os.Bundle
import androidx.core.view.WindowCompat
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {{
    override fun onCreate(savedInstanceState: Bundle?) {{
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }}
}}
"""
        path.write_text(patched)
        print(f"Patched MainActivity: {path}")

# --- styles.xml (values + values-night) ---
transparent_items = """
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:enforceNavigationBarContrast">false</item>
        <item name="android:enforceStatusBarContrast">false</item>"""

for styles_path in android.glob("app/src/main/res/values*/styles.xml"):
    text = styles_path.read_text()
    if "android:statusBarColor" in text and "transparent" in text:
        print(f"styles.xml already transparent: {styles_path}")
        continue
    updated = False
    for theme in ("NormalTheme", "LaunchTheme"):
        pattern = rf"(<style name=\"{theme}\"[^>]*>)(.*?)(</style>)"
        match = re.search(pattern, text, re.DOTALL)
        if match and "android:statusBarColor" not in match.group(2):
            inner = match.group(2) + transparent_items + "\n    "
            text = text[: match.start()] + match.group(1) + inner + match.group(3) + text[match.end() :]
            updated = True
    if updated:
        styles_path.write_text(text)
        print(f"Patched styles: {styles_path}")

# --- build.gradle.kts or build.gradle ---
for gradle_name in ("build.gradle.kts", "build.gradle"):
    app_gradle = android / "app" / gradle_name
    if not app_gradle.exists():
        continue
    text = app_gradle.read_text()
    original = text
    text = re.sub(r"compileSdk\s*=\s*\d+", "compileSdk = 35", text)
    text = re.sub(r"compileSdkVersion\s*=\s*\d+", "compileSdkVersion 35", text)
    text = re.sub(r"targetSdk\s*=\s*\d+", "targetSdk = 35", text)
    text = re.sub(r"targetSdkVersion\s*=\s*\d+", "targetSdkVersion 35", text)
    if text != original:
        app_gradle.write_text(text)
        print(f"Patched SDK levels in app/{gradle_name}")
    else:
        print(f"app/{gradle_name}: SDK levels unchanged or use flutter.* variables")

# --- AndroidManifest: cutout / resize ---
manifest = android / "app/src/main/AndroidManifest.xml"
if manifest.exists():
    text = manifest.read_text()
    if "windowLayoutInDisplayCutoutMode" not in text:
        text = text.replace(
            "<activity",
            '<activity\n            android:windowLayoutInDisplayCutoutMode="shortEdges"',
            1,
        )
        manifest.write_text(text)
        print("Patched AndroidManifest cutout mode")
PY

echo "patch_android_edge_to_edge: done"
