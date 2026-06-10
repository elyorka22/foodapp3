import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Logs the resolved request URL before every HTTP call (debug builds only).
class UrlLogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('[FoodApp HTTP] ${options.method} ${options.uri}');
    handler.next(options);
  }
}
