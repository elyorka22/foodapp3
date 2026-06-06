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

  /// Public web origin for Telegram Login Widget (derived from API base).
  static String get webAppBaseUrl {
    var url = normalizedApiBaseUrl;
    const suffix = '/api/v1';
    if (url.toLowerCase().endsWith(suffix)) {
      url = url.substring(0, url.length - suffix.length);
    }
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  static Uri get telegramLoginWidgetUrl =>
      Uri.parse('$webAppBaseUrl/auth/telegram-mobile');

  static const String wsBaseUrl = String.fromEnvironment('WS_BASE_URL');

  /// Trimmed API base without trailing slash (used by Dio).
  static String get normalizedApiBaseUrl {
    var url = apiBaseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  static String get normalizedWsBaseUrl {
    var url = wsBaseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  /// True when base URL accidentally contains `/api/v1` twice.
  static bool get hasDuplicateApiV1InBase {
    return RegExp(r'/api/v1/api/v1', caseSensitive: false).hasMatch(normalizedApiBaseUrl);
  }

  /// Builds the URL Dio will request (for diagnostics).
  static String resolveRequestUrl(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    if (normalizedPath.contains('/api/v1/')) {
      throw FlutterError(
        'Path must not include /api/v1 — baseUrl already has it: $normalizedPath',
      );
    }
    // Match Dio: baseUrl + path (not Uri.resolve, which drops /api/v1).
    var combined = '$normalizedApiBaseUrl$normalizedPath';
    if (queryParameters != null && queryParameters.isNotEmpty) {
      final query = queryParameters.entries
          .map((e) => '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent('${e.value}')}')
          .join('&');
      combined = '$combined?$query';
    }
    return combined;
  }

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

    if (hasDuplicateApiV1InBase) {
      throw FlutterError(
        'API_BASE_URL must not contain /api/v1 twice.\n'
        'Use: https://your-host/api/v1 (paths in code are relative, e.g. /restaurants).',
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
