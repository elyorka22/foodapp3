/// iOS / Android release checklist — no runtime logic.
abstract final class ReleaseConfig {
  static const String iosBundleId = 'com.foodapp.customer';
  static const String androidApplicationId = 'com.foodapp.customer';

  /// iOS: configure signing in Xcode, Push Notifications capability, App Transport Security for API host.
  /// Android: minSdk 21+, ProGuard rules for Dio/WebView when enabling R8.
  static const List<String> iosReleaseChecklist = [
    'Apple Developer signing & provisioning profile',
    'Push Notifications + Background Modes (remote-notification)',
    'Privacy manifests (photo, location if used)',
    'TELEGRAM_BOT_USERNAME and API_BASE_URL via dart-define or xcconfig',
    'TestFlight internal QA',
  ];
}
