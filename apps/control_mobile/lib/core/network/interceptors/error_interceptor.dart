import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final message = ApiException.fromDio(err);
    final statusCode = err.response?.statusCode;

    // Never log request/response bodies (may contain passwords).
    debugPrint(
      '[API ERROR] ${err.requestOptions.method} ${err.requestOptions.path} '
      'status=$statusCode message=$message',
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
