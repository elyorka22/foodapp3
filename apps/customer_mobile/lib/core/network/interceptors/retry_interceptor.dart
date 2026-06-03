import 'package:dio/dio.dart';

/// Retries idempotent requests on transient network failures.
class RetryInterceptor extends Interceptor {
  RetryInterceptor(this._dio, {this.maxRetries = 2});

  final Dio _dio;
  final int maxRetries;

  static const _retryDelay = Duration(milliseconds: 800);
  static const _retryMethods = {'GET', 'HEAD', 'OPTIONS'};

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (!_shouldRetry(err)) {
      return handler.next(err);
    }

    final extra = Map<String, dynamic>.from(err.requestOptions.extra);
    final attempt = (extra['_retryCount'] as int?) ?? 0;
    if (attempt >= maxRetries) {
      return handler.next(err);
    }

    extra['_retryCount'] = attempt + 1;
    await Future<void>.delayed(_retryDelay);

    try {
      final response = await _dio.fetch<dynamic>(
        err.requestOptions.copyWith(extra: extra),
      );
      return handler.resolve(response);
    } on DioException catch (e) {
      return onError(e, handler);
    }
  }

  bool _shouldRetry(DioException err) {
    if (!_retryMethods.contains(err.requestOptions.method.toUpperCase())) {
      return false;
    }
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.connectionError;
  }
}
