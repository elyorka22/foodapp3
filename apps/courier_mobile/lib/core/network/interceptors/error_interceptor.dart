import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final message = ApiException.fromDio(err);
    final statusCode = err.response?.statusCode;

    debugPrint(
      '[API ERROR] ${err.requestOptions.method} ${err.requestOptions.uri} '
      'type=${err.type.name} status=$statusCode message=$message',
    );
    if (err.response?.data != null) {
      debugPrint('[API ERROR body] ${err.response!.data}');
    }

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
