import 'package:flutter/foundation.dart';

class AppConfig {
  AppConfig._();

  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const String appName = 'FoodApp Control';

  /// Staff login client id sent as LoginDto.client (`control` → SUPER_ADMIN only).
  static const String clientId = 'control';

  /// Mobile + VPN: TLS/handshake can be slow when the tunnel flips.
  static const Duration connectTimeout = Duration(seconds: 45);

  /// Wait for API body after the request has left the device.
  static const Duration receiveTimeout = Duration(seconds: 90);

  /// Do not set a send timeout. Dio on Android can fire sendTimeout after the
  /// request already reached the server, which surfaces as a false client timeout.

  static String get normalizedApiBaseUrl {
    var url = apiBaseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    if (!url.toLowerCase().endsWith('/api/v1')) {
      url = '$url/api/v1';
    }
    return url;
  }

  /// Host only (no path/secrets) for on-screen diagnostics.
  static String get apiHostLabel {
    try {
      final uri = Uri.parse(normalizedApiBaseUrl);
      if (uri.host.isEmpty) return normalizedApiBaseUrl;
      return uri.host;
    } catch (_) {
      return normalizedApiBaseUrl;
    }
  }

  static bool get hasDuplicateApiV1InBase {
    return RegExp(r'/api/v1/api/v1', caseSensitive: false)
        .hasMatch(normalizedApiBaseUrl);
  }

  static final RegExp _forbiddenHost = RegExp(
    r'localhost|127\.0\.0\.1|10\.0\.2\.2',
    caseSensitive: false,
  );

  /// Human-readable boot error, or null when config is OK.
  /// Prefer this over throwing before [runApp] (native splash would hang).
  static String? configError() {
    if (apiBaseUrl.trim().isEmpty) {
      return 'API_BASE_URL is missing.\n'
          'Rebuild with:\n'
          '--dart-define=API_BASE_URL=https://foodapp.uz/api/v1';
    }
    if (hasDuplicateApiV1InBase) {
      return 'API_BASE_URL contains /api/v1 twice.\n'
          'Use: https://foodapp.uz/api/v1';
    }
    if (kReleaseMode && _forbiddenHost.hasMatch(apiBaseUrl)) {
      return 'Release build cannot use localhost in API_BASE_URL.\n'
          'Use: https://foodapp.uz/api/v1';
    }
    return null;
  }

  static void ensureConfigured() {
    final err = configError();
    if (err != null) {
      throw FlutterError(err);
    }
  }
}
