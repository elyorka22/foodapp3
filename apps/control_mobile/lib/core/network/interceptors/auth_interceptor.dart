import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../diagnostics/diagnostic_log.dart';
import '../../storage/token_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage);

  final TokenStorage _storage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    options.extra['control_req_started_ms'] =
        DateTime.now().millisecondsSinceEpoch;

    final requestId = options.extra['diag_request_id'] as String?;
    if (requestId != null) {
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'dio_on_request',
        message:
            '${options.method} ${options.path} '
            'hasAuthHeader=false_for_login_check',
      );
    }

    if (!_isPublicAuthPath(options)) {
      try {
        final token = await _storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          if (requestId != null) {
            DiagnosticLog.instance.log(
              requestId: requestId,
              stage: 'dio_on_request',
              message: 'Authorization header attached (value redacted)',
            );
          }
        }
      } catch (_) {}
    } else if (requestId != null) {
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'dio_on_request',
        message: 'public auth path — no Authorization header',
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final started = response.requestOptions.extra['control_req_started_ms'];
    final elapsedMs = started is int
        ? DateTime.now().millisecondsSinceEpoch - started
        : null;
    final requestId =
        response.requestOptions.extra['diag_request_id'] as String?;
    if (requestId != null) {
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'dio_on_response',
        message: 'status=${response.statusCode}',
        elapsedMs: elapsedMs,
      );
    }
    // Status + timing only — never log response bodies or Authorization.
    debugPrint(
      '[API OK] ${response.requestOptions.method} ${response.requestOptions.path} '
      'status=${response.statusCode} elapsedMs=$elapsedMs',
    );
    handler.next(response);
  }

  bool _isPublicAuthPath(RequestOptions options) {
    final path = options.uri.path;
    return path.endsWith('/auth/login') || path.endsWith('/auth/staff/login');
  }
}
