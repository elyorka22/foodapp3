import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../diagnostics/diagnostic_log.dart';
import '../diagnostics/diagnostic_platform.dart';
import '../storage/storage_providers.dart';
import '../storage/token_storage.dart';
import 'http_adapter_stub.dart'
    if (dart.library.io) 'http_adapter_io.dart' as http_adapter;
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

final dioProvider = Provider<Dio>((ref) {
  return createDioClient(ref.watch(tokenStorageProvider));
});

Dio createDioClient(TokenStorage storage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.normalizedApiBaseUrl,
      connectTimeout: AppConfig.connectTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      // Intentionally no sendTimeout — Dio on Android can false-fire sendTimeout
      // after the request already left the device.
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      responseType: ResponseType.json,
      // NestJS @Post() defaults to 201 Created; treat all 2xx as success.
      validateStatus: (status) => status != null && status >= 200 && status < 300,
      // VPN / flaky mobile networks — avoid sticky broken pooled sockets.
      persistentConnection: false,
    ),
  );
  http_adapter.configureNativeHttpClient(dio);
  DiagnosticLog.instance.log(
    requestId: 'boot',
    stage: 'dio_config',
    message:
        'baseUrlHost=${AppConfig.apiHostLabel} '
        'connectTimeout=${AppConfig.connectTimeout.inSeconds}s '
        'receiveTimeout=${AppConfig.receiveTimeout.inSeconds}s '
        'sendTimeout=null '
        'customIoAdapter=${http_adapter.controlNativeHttpAdapterInstalled} '
        'httpAdapterKind=${http_adapter.controlHttpAdapterKind} '
        'alpnAdvertised=${http_adapter.kControlClientAlpnProtocols.join(",")} '
        'platform=${diagnosticPlatformSummary()}',
  );
  dio.interceptors.addAll([
    AuthInterceptor(storage),
    // Retry before ErrorInterceptor so transient VPN drops can recover.
    RetryInterceptor(dio),
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
