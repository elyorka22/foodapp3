import 'package:flutter/foundation.dart';

class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String appName = 'FoodApp Business';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  static String get normalizedApiBaseUrl {
    var url = apiBaseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  static final RegExp _forbiddenHost = RegExp(
    r'localhost|127\.0\.0\.1|10\.0\.2\.2',
    caseSensitive: false,
  );

  static void ensureConfigured() {
    if (apiBaseUrl.trim().isEmpty) {
      throw FlutterError(
        'API_BASE_URL is required.\n'
        'Example: --dart-define=API_BASE_URL=https://api.example.com/api/v1',
      );
    }
    if (kReleaseMode && _forbiddenHost.hasMatch(apiBaseUrl)) {
      throw FlutterError('Release builds cannot use localhost in API_BASE_URL.');
    }
  }
}
