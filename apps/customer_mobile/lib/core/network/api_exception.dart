import 'package:dio/dio.dart';
import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.raw,
  });

  final String message;
  final int? statusCode;
  final Object? raw;

  @override
  String toString() => displayMessage;

  String get displayMessage {
    if (statusCode != null) {
      return '$message (HTTP $statusCode)';
    }
    return message;
  }

  static String parseMessage(Object? data) {
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is List) return msg.map((e) => e.toString()).join(', ');
      if (msg is String && msg.isNotEmpty) return msg;
      final error = data['error'];
      if (error is String && error.isNotEmpty) return error;
    }
    if (data is String && data.trim().isNotEmpty) {
      final trimmed = data.trim();
      if (trimmed.startsWith('<')) {
        return 'Server HTML javob qaytardi (API URL noto\'g\'ri bo\'lishi mumkin)';
      }
      if (trimmed.length <= 200) return trimmed;
      return '${trimmed.substring(0, 200)}...';
    }
    return 'So\'rov bajarilmadi';
  }

  static String fromDio(DioException err) {
    final response = err.response;
    if (response?.data != null) {
      final parsed = parseMessage(response!.data);
      if (parsed != 'So\'rov bajarilmadi') {
        return parsed;
      }
      if (response.statusCode != null) {
        return 'HTTP ${response.statusCode}: ${parseMessage(response.data)}';
      }
    }

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.transformTimeout:
        return 'Server javob bermadi (timeout). API: ${AppConfig.normalizedApiBaseUrl}';
      case DioExceptionType.connectionError:
        return 'Serverga ulanib bo\'lmadi. Internet yoki API URL: ${AppConfig.normalizedApiBaseUrl}';
      case DioExceptionType.badCertificate:
        return 'SSL sertifikat xatosi. HTTPS sozlamalarini tekshiring.';
      case DioExceptionType.badResponse:
        final code = response?.statusCode;
        if (code == 401) return 'Avtorizatsiya talab qilinadi (401)';
        if (code == 403) return 'Kirish taqiqlangan (403)';
        if (code == 404) {
          return 'API topilmadi (404): ${err.requestOptions.uri}';
        }
        if (code != null && code >= 500) {
          return 'Server xatosi (HTTP $code). Keyinroq urinib ko\'ring.';
        }
        if (code != null) return 'Server xatosi (HTTP $code)';
        return 'Server noto\'g\'ri javob qaytardi';
      case DioExceptionType.cancel:
        return 'So\'rov bekor qilindi';
      case DioExceptionType.unknown:
        final underlying = err.error?.toString();
        if (underlying != null && underlying.isNotEmpty) {
          return 'Tarmoq xatosi: $underlying';
        }
        return 'Noma\'lum tarmoq xatosi. API: ${AppConfig.normalizedApiBaseUrl}';
    }
  }

  static String formatError(Object error) {
    if (error is ApiException) return error.displayMessage;
    if (error is DioException) {
      final inner = error.error;
      if (inner is ApiException) return inner.displayMessage;
      return fromDio(error);
    }
    final text = error.toString();
    if (text.startsWith('Exception: ')) {
      return text.substring('Exception: '.length);
    }
    return text;
  }
}
