import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../diagnostics/diagnostic_classifier.dart';
import '../../diagnostics/diagnostic_log.dart';
import '../../diagnostics/diagnostic_sanitizer.dart';
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
    final requestId =
        err.requestOptions.extra['diag_request_id'] as String?;
    final cls = DiagnosticClassifier.fromDio(err);
    final safeErr = DiagnosticSanitizer.sanitize(
      '${err.type} ${err.error?.runtimeType ?? ''} ${err.message ?? ''}',
    );

    if (requestId != null) {
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'dio_on_error',
        message: 'status=$statusCode detail=$safeErr ui="$message"',
        elapsedMs: elapsedMs,
        failureClass: cls,
      );
    }

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
