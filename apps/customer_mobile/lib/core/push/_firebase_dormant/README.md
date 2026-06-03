# Firebase push (dormant)

FCM is **not** included in CI/APK builds. The app uses `PushNotificationServiceStub` and the backend `PUSH_PROVIDER=noop`.

## Re-enable later

1. Add to `pubspec.yaml`: `firebase_core`, `firebase_messaging`, `flutter_local_notifications`
2. Add `google-services.json` under `android/app/`
3. Restore `firebase_push_notification_service.dart` from `firebase_push_notification_service.dart.reference` into `lib/core/push/`
4. Update `push_providers.dart` to return `FirebasePushNotificationService()` when configured
5. Set backend `PUSH_PROVIDER=firebase` and Firebase env vars

See `APK_BUILD_GUIDE.md` at repository root.
