import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../storage/storage_providers.dart';
import '../storage/token_storage.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';

final dioProvider = Provider<Dio>((ref) {
  return createDioClient(ref.watch(tokenStorageProvider));
});

Dio createDioClient(TokenStorage storage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.normalizedApiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      // Intentionally no sendTimeout — see AppConfig comment.
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      responseType: ResponseType.json,
    ),
  );
  dio.interceptors.addAll([
    AuthInterceptor(storage),
    ErrorInterceptor(),
  ]);
  if (kDebugMode) {
    // Log method/path only — never request/response bodies (passwords/tokens).
    dio.interceptors.add(
      LogInterceptor(
        request: true,
        requestHeader: false,
        requestBody: false,
        responseHeader: false,
        responseBody: false,
        error: true,
      ),
    );
  }
  return dio;
}
