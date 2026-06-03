import 'package:flutter/foundation.dart';

/// API and app configuration. Set via --dart-define at build/run time.
class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL');

  static const String appName = 'FoodApp';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  /// Same as web `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (without @).
  static const String telegramBotUsername = String.fromEnvironment(
    'TELEGRAM_BOT_USERNAME',
    defaultValue: '',
  );

  static const String wsBaseUrl = String.fromEnvironment('WS_BASE_URL');

  static final RegExp _forbiddenHost = RegExp(
    r'localhost|127\.0\.0\.1|10\.0\.2\.2',
    caseSensitive: false,
  );

  /// Call from [main] before [runApp]. Required for all release/APK builds.
  static void ensureConfigured() {
    final api = apiBaseUrl.trim();
    final ws = wsBaseUrl.trim();

    if (api.isEmpty) {
      throw FlutterError(
        'API_BASE_URL is required.\n'
        'Example: --dart-define=API_BASE_URL=https://api.example.com/api/v1',
      );
    }

    if (ws.isEmpty) {
      throw FlutterError(
        'WS_BASE_URL is required.\n'
        'Example: --dart-define=WS_BASE_URL=https://api.example.com',
      );
    }

    if (kReleaseMode) {
      if (_forbiddenHost.hasMatch(api)) {
        throw FlutterError(
          'Release builds cannot use localhost, 127.0.0.1, or 10.0.2.2 in API_BASE_URL.',
        );
      }
      if (_forbiddenHost.hasMatch(ws)) {
        throw FlutterError(
          'Release builds cannot use localhost, 127.0.0.1, or 10.0.2.2 in WS_BASE_URL.',
        );
      }
    }
  }
}
