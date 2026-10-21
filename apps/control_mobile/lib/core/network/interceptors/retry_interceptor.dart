import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Retries transient network failures (common on mobile + VPN).
class RetryInterceptor extends Interceptor {
  RetryInterceptor(this._dio, {this.maxRetries = 2});

  final Dio _dio;
  final int maxRetries;

  static const _extraKey = 'control_retry_count';

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (!_shouldRetry(err)) {
      handler.next(err);
      return;
    }

    final attempt = (err.requestOptions.extra[_extraKey] as int?) ?? 0;
    if (attempt >= maxRetries) {
      handler.next(err);
      return;
    }

    final next = attempt + 1;
    final delayMs = 500 * next;
    debugPrint(
      '[API RETRY] ${err.requestOptions.method} ${err.requestOptions.path} '
      'attempt=$next/$maxRetries type=${err.type} waitMs=$delayMs',
    );
    await Future<void>.delayed(Duration(milliseconds: delayMs));

    try {
      final opts = err.requestOptions;
      opts.extra[_extraKey] = next;
      final response = await _dio.fetch<dynamic>(opts);
      handler.resolve(response);
    } on DioException catch (e) {
      handler.next(e);
    } catch (_) {
      handler.next(err);
    }
  }

  bool _shouldRetry(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
      case DioExceptionType.unknown:
        return true;
      case DioExceptionType.badResponse:
        final code = err.response?.statusCode ?? 0;
        return code == 502 || code == 503 || code == 504;
      case DioExceptionType.cancel:
      case DioExceptionType.badCertificate:
      case DioExceptionType.transformTimeout:
        return false;
    }
  }
}
