import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class UrlLogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('[Business HTTP] ${options.method} ${options.uri}');
    handler.next(options);
  }
}
