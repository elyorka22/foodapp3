import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final message = ApiException.fromDio(err);
    final statusCode = err.response?.statusCode;
    final started = err.requestOptions.extra['control_req_started_ms'];
    final elapsedMs = started is int
        ? DateTime.now().millisecondsSinceEpoch - started
        : null;

    // Safe diagnostics only — never log bodies (may contain passwords/tokens).
    debugPrint(
      '[API ERROR] ${err.requestOptions.method} ${err.requestOptions.path} '
      'type=${err.type} status=$statusCode elapsedMs=$elapsedMs '
      'message=$message',
    );

    handler.next(
      err.copyWith(
        error: ApiException(
          message: message,
          statusCode: statusCode,
          raw: err.response?.data,
        ),
      ),
    );
  }
}
