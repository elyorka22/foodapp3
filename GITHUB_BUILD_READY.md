# GitHub Build Ready — Customer Mobile (No Firebase)

**Date:** 2026-06-03  
**Goal:** APK builds in GitHub Actions without Firebase; notification architecture preserved.

---

## Build status

| Check | Status |
|-------|--------|
| Firebase removed from `pubspec.yaml` | ✅ Done |
| Default push transport: `PushNotificationServiceStub` | ✅ Done |
| Firebase code dormant (`_firebase_dormant/`) | ✅ Done |
| GitHub workflow `customer-mobile-apk.yml` | ✅ Added |
| Env validation script | ✅ `scripts/validate_build_env.sh` |
| `API_BASE_URL` + `WS_BASE_URL` required | ✅ App + CI script |
| Localhost / `10.0.2.2` blocked in release | ✅ `AppConfig.ensureConfigured()` |
| Backend `PUSH_PROVIDER=noop` default | ✅ Unchanged (no Firebase env) |
| Local `flutter analyze/test/build` on this machine | ⚠️ Flutter SDK not installed here — run in CI or locally |

**First green CI run** requires GitHub secrets (below). Fork PRs without secrets will fail at validation (expected).

---

## Required GitHub secrets

| Secret | Required |
|--------|----------|
| `API_BASE_URL` | Yes — production API, e.g. `https://api.example.com/api/v1` |
| `WS_BASE_URL` | Yes — e.g. `https://api.example.com` |
| `TELEGRAM_BOT_USERNAME` | Optional |

Do **not** add Firebase secrets for APK workflow.

---

## APK build instructions

1. Add secrets in GitHub repository settings.
2. Push to `main` or run workflow manually.
3. Download artifact **foodapp-customer-apk** from Actions tab.

Details: [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md)

---

## Notification architecture (unchanged)

Still in FoodApp backend + mobile:

- `notification_templates`
- `notifications` (history)
- `user_devices` (device id; push token optional)
- Notification center UI
- `NotificationService` + `PUSH_PROVIDER=noop` (no FCM send)

---

## Changes in this pass

- Removed `firebase_core`, `firebase_messaging`, `flutter_local_notifications` from dependencies
- Stub push provider; device registration without FCM token
- Moved Firebase implementation reference to `lib/core/push/_firebase_dormant/`
- Strict `WS_BASE_URL` + forbidden hosts for release builds
- CI workflow with artifact `foodapp-customer-apk`

---

## Remaining non-critical issues

From `FINAL_RELEASE_REPORT.md` (unchanged by this pass):

- Medium: list empty states, image placeholders, location cache TTL
- High (optional): guest notification fetch, restaurant products loading UI
- iOS platform not in CI workflow (Android APK only)
- Promotions screen placeholder

---

## Launch recommendation

**Proceed** once:

1. GitHub secrets are set
2. One successful **Customer Mobile APK** workflow run
3. Manual install + smoke test on a physical Android device

Enable Firebase in a follow-up release when `google-services.json` and backend FCM credentials are ready.

---

## Security

- Do not commit `.env`, `google-services.json`, or service account JSON
- `.gitignore` covers `.env` and Android `key.properties`
- CI uses GitHub Secrets only for API URLs
