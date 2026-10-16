import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
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

    if (!_isPublicAuthPath(options)) {
      try {
        final token = await _storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      } catch (_) {}
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final started = response.requestOptions.extra['control_req_started_ms'];
    final elapsedMs = started is int
        ? DateTime.now().millisecondsSinceEpoch - started
        : null;
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
