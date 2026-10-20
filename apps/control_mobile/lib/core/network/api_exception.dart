import 'package:dio/dio.dart';
import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.raw,
    this.transportDetail,
    this.causeType,
  });

  final String message;
  final int? statusCode;
  final Object? raw;

  /// Sanitized native transport summary (HttpException/SocketException/…).
  final String? transportDetail;

  /// Original nested error type name before interceptor replacement.
  final String? causeType;

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
      if (trimmed.length <= 200) return trimmed;
      return '${trimmed.substring(0, 200)}...';
    }
    return 'So\'rov bajarilmadi';
  }

  /// Maps HTTP auth failures regardless of [DioException.type].
  ///
  /// Important: a partial response can arrive with type receiveTimeout; never
  /// hide 400/401/403 behind a generic timeout string.
  static String? messageForHttpStatus(int? code) {
    if (code == 401) return 'Login yoki parol noto\'g\'ri';
    if (code == 403) {
      return 'Kirish taqiqlangan. FoodApp Control faqat SUPER_ADMIN uchun.';
    }
    if (code == 400) {
      return 'Noto\'g\'ri so\'rov (client yoki maydonlar).';
    }
    return null;
  }

  static String fromDio(DioException err) {
    final response = err.response;
    final code = response?.statusCode;

    final byStatus = messageForHttpStatus(code);
    if (byStatus != null) return byStatus;

    if (response?.data != null) {
      final parsed = parseMessage(response!.data);
      if (parsed != 'So\'rov bajarilmadi') {
        return parsed;
      }
    }

    final host = AppConfig.apiHostLabel;
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
        return 'Serverga ulanish sekin ($host). Internetni tekshirib, qayta urinib ko‘ring.';
      case DioExceptionType.sendTimeout:
        return 'So‘rov yuborilmadi ($host). Qayta urinib ko‘ring.';
      case DioExceptionType.receiveTimeout:
        return 'Server javob bermadi (timeout, $host). Qayta urinib ko‘ring.';
      case DioExceptionType.connectionError:
        return _withTransport(
          'Serverga ulanib bo‘lmadi ($host). Internet yoki VPN ni tekshiring.',
          err,
        );
      case DioExceptionType.badCertificate:
        return 'SSL sertifikat xatosi ($host).';
      case DioExceptionType.badResponse:
        if (code != null) return 'Server xatosi (HTTP $code)';
        return 'Server noto‘g‘ri javob qaytardi';
      case DioExceptionType.cancel:
        return 'So‘rov bekor qilindi';
      case DioExceptionType.unknown:
        return _withTransport(
          'Tarmoq xatosi ($host). Qayta urinib ko‘ring.',
          err,
        );
      default:
        return 'Tarmoq xatosi. Qayta urinib ko‘ring.';
    }
  }

  /// Append a short native hint when Dio only reports a generic failure.
  static String _withTransport(String base, DioException err) {
    final raw = err.error?.toString().trim() ?? '';
    if (raw.isEmpty) return base;
    // Skip noisy wrapper prefixes.
    final cleaned = raw
        .replaceFirst(RegExp(r'^Exception:\s*'), '')
        .replaceFirst(RegExp(r'^DioException\s*\[[^\]]+\]:\s*'), '');
    if (cleaned.isEmpty || cleaned == base) return base;
    final short =
        cleaned.length <= 120 ? cleaned : '${cleaned.substring(0, 120)}…';
    return '$base\n$short';
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
