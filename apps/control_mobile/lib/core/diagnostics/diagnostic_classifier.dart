import 'package:dio/dio.dart';

/// High-level failure class for the diagnostics UI.
enum DiagnosticFailureClass {
  none,
  dns,
  tcp,
  tls,
  headersNotReceived,
  bodyNotCompleted,
  httpClientError,
  httpServerError,
  parse,
  secureStorage,
  timeoutUnknownStage,
  unknown,
}

abstract final class DiagnosticClassifier {
  static DiagnosticFailureClass fromDio(DioException err) {
    final code = err.response?.statusCode;
    if (code != null) {
      if (code == 401 || code == 403 || code == 400) {
        return DiagnosticFailureClass.httpClientError;
      }
      if (code >= 500) return DiagnosticFailureClass.httpServerError;
      if (code >= 400) return DiagnosticFailureClass.httpClientError;
    }

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
        return DiagnosticFailureClass.tcp;
      case DioExceptionType.sendTimeout:
        return DiagnosticFailureClass.timeoutUnknownStage;
      case DioExceptionType.receiveTimeout:
        // Dio IO adapter times out waiting for response headers on request.close().
        return DiagnosticFailureClass.headersNotReceived;
      case DioExceptionType.badCertificate:
        return DiagnosticFailureClass.tls;
      case DioExceptionType.connectionError:
        final msg = (err.error?.toString() ?? err.message ?? '').toLowerCase();
        if (msg.contains('failed host lookup') ||
            msg.contains('name not resolved') ||
            msg.contains('dns')) {
          return DiagnosticFailureClass.dns;
        }
        if (msg.contains('certificate') ||
            msg.contains('handshake') ||
            msg.contains('ssl') ||
            msg.contains('tls')) {
          return DiagnosticFailureClass.tls;
        }
        return DiagnosticFailureClass.tcp;
      case DioExceptionType.badResponse:
        if (code != null && code >= 500) {
          return DiagnosticFailureClass.httpServerError;
        }
        return DiagnosticFailureClass.httpClientError;
      case DioExceptionType.cancel:
        return DiagnosticFailureClass.unknown;
      case DioExceptionType.transformTimeout:
        return DiagnosticFailureClass.parse;
      case DioExceptionType.unknown:
        final msg = (err.error?.toString() ?? '').toLowerCase();
        if (msg.contains('socket')) return DiagnosticFailureClass.tcp;
        if (msg.contains('format') || msg.contains('json')) {
          return DiagnosticFailureClass.parse;
        }
        return DiagnosticFailureClass.unknown;
    }
  }

  static DiagnosticFailureClass fromObject(Object error) {
    if (error is DioException) return fromDio(error);
    final text = error.toString().toLowerCase();
    if (text.contains('sessiyani saqlab') || text.contains('secure')) {
      return DiagnosticFailureClass.secureStorage;
    }
    if (text.contains('handshake') ||
        text.contains('certificate') ||
        text.contains('tls') ||
        text.contains('ssl')) {
      return DiagnosticFailureClass.tls;
    }
    if (text.contains('failed host lookup') || text.contains('dns')) {
      return DiagnosticFailureClass.dns;
    }
    if (text.contains('socket')) {
      return DiagnosticFailureClass.tcp;
    }
    if (text.contains('before full header') ||
        text.contains('connection closed before')) {
      return DiagnosticFailureClass.headersNotReceived;
    }
    if (text.contains('json') || text.contains('format') || text.contains('type')) {
      return DiagnosticFailureClass.parse;
    }
    return DiagnosticFailureClass.unknown;
  }

  static String label(DiagnosticFailureClass c) {
    switch (c) {
      case DiagnosticFailureClass.none:
        return 'OK';
      case DiagnosticFailureClass.dns:
        return 'DNS/resolution';
      case DiagnosticFailureClass.tcp:
        return 'TCP connection';
      case DiagnosticFailureClass.tls:
        return 'TLS/certificate';
      case DiagnosticFailureClass.headersNotReceived:
        return 'Request sent, response headers not received';
      case DiagnosticFailureClass.bodyNotCompleted:
        return 'Response received but body not completed';
      case DiagnosticFailureClass.httpClientError:
        return 'HTTP 4xx';
      case DiagnosticFailureClass.httpServerError:
        return 'HTTP 5xx';
      case DiagnosticFailureClass.parse:
        return 'Malformed JSON / parsing';
      case DiagnosticFailureClass.secureStorage:
        return 'Secure storage failure';
      case DiagnosticFailureClass.timeoutUnknownStage:
        return 'Timeout (stage unknown)';
      case DiagnosticFailureClass.unknown:
        return 'Unknown error';
    }
  }
}
