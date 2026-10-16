import 'package:dio/dio.dart';

import 'diagnostic_classifier.dart';
import 'diagnostic_sanitizer.dart';
import 'native_error_detail_stub.dart'
    if (dart.library.io) 'native_error_detail_io.dart' as native_detail;

/// Formats transport exceptions for diagnostics without inventing causes.
abstract final class NativeErrorFormatter {
  /// Safe one-line summary (no bodies/tokens/cookies).
  static String describe(
    Object error, {
    StackTrace? stackTrace,
    String? host,
    String? path,
    String? stage,
    int? elapsedMs,
    String? alpnAdvertised,
  }) {
    final parts = <String>[];
    if (stage != null && stage.isNotEmpty) parts.add('failStage=$stage');
    if (host != null) parts.add('host=$host');
    if (path != null) parts.add('path=$path');
    if (elapsedMs != null) parts.add('elapsedMs=$elapsedMs');
    if (alpnAdvertised != null) {
      parts.add('alpnAdvertised=$alpnAdvertised');
      parts.add('negotiatedAlpn=${native_detail.negotiatedAlpnNote()}');
    }
    parts.addAll(_describeObject(error));
    if (stackTrace != null) {
      parts.add('stack=${_shortStack(stackTrace)}');
    }
    return DiagnosticSanitizer.sanitizeTechnical(parts.join(' | '));
  }

  static DiagnosticFailureClass classifyObject(Object error) {
    if (error is DioException) {
      return DiagnosticClassifier.fromDio(error);
    }
    return native_detail.classifyNative(error);
  }

  static String inferFailStage(Object error, {String? currentStage}) {
    if (currentStage != null && currentStage.isNotEmpty) return currentStage;
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.connectionError:
          return 'connecting';
        case DioExceptionType.sendTimeout:
          return 'writing_request';
        case DioExceptionType.receiveTimeout:
          // Dio IO adapter applies receiveTimeout to request.close()
          // (waiting for response headers).
          return 'waiting_response_headers';
        case DioExceptionType.badCertificate:
          return 'tls_handshake';
        case DioExceptionType.badResponse:
          return 'response_received';
        case DioExceptionType.cancel:
          return 'cancelled';
        case DioExceptionType.transformTimeout:
          return 'parsing_body';
        case DioExceptionType.unknown:
          final inner = error.error;
          if (inner != null) {
            return native_detail.inferNativeStage(inner) ?? 'unknown';
          }
          return 'unknown';
      }
    }
    return native_detail.inferNativeStage(error) ?? 'unknown';
  }

  static List<String> _describeObject(Object error) {
    final out = <String>['errorType=${error.runtimeType}'];
    if (error is DioException) {
      out.add('dioType=${error.type}');
      final code = error.response?.statusCode;
      if (code != null) out.add('httpStatus=$code');
      final msg = error.message;
      if (msg != null && msg.trim().isNotEmpty) {
        out.add('dioMessage=$msg');
      }
      final inner = error.error;
      if (inner != null) {
        out.add('causeType=${inner.runtimeType}');
        out.addAll(native_detail.describeNative(inner));
      }
      return out;
    }
    out.addAll(native_detail.describeNative(error));
    return out;
  }

  static String _shortStack(StackTrace stackTrace) {
    return stackTrace
        .toString()
        .split('\n')
        .where((l) => l.trim().isNotEmpty)
        .take(8)
        .join(' :: ');
  }
}
