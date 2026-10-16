import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../diagnostics/diagnostic_classifier.dart';
import '../../diagnostics/diagnostic_log.dart';
import '../../diagnostics/native_error_formatter.dart';
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
    final host = err.requestOptions.uri.host;
    final path = err.requestOptions.uri.path;
    final failStage = NativeErrorFormatter.inferFailStage(err);
    // Capture native HttpException/SocketException BEFORE replacing err.error.
    final transportDetail = NativeErrorFormatter.describe(
      err,
      stackTrace: err.stackTrace,
      host: host,
      path: path,
      stage: failStage,
      elapsedMs: elapsedMs,
    );

    if (requestId != null) {
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'dio_on_error',
        message: 'ui="$message" | $transportDetail',
        elapsedMs: elapsedMs,
        failureClass: cls,
      );
    }

    // Safe diagnostics only — never log bodies (may contain passwords/tokens).
    debugPrint(
      '[API ERROR] ${err.requestOptions.method} $path '
      'type=${err.type} status=$statusCode elapsedMs=$elapsedMs '
      'failStage=$failStage detail=$transportDetail',
    );

    handler.next(
      err.copyWith(
        error: ApiException(
          message: message,
          statusCode: statusCode,
          raw: err.response?.data,
          transportDetail: transportDetail,
          causeType: err.error?.runtimeType.toString() ?? err.type.toString(),
        ),
      ),
    );
  }
}
