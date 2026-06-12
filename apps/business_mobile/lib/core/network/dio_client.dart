import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../storage/storage_providers.dart';
import '../storage/token_storage.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/url_log_interceptor.dart';

final dioProvider = Provider<Dio>((ref) {
  return createDioClient(ref.watch(tokenStorageProvider));
});

Dio createDioClient(TokenStorage storage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.normalizedApiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      sendTimeout: AppConfig.sendTimeout,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    ),
  );
  dio.interceptors.addAll([
    AuthInterceptor(storage),
    ErrorInterceptor(),
  ]);
  if (kDebugMode) {
    dio.interceptors.insert(0, UrlLogInterceptor());
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
  }
  return dio;
}
