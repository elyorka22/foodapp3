import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/app_config.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/diagnostics/diagnostic_classifier.dart';
import '../../../core/diagnostics/diagnostic_log.dart';
import '../../../core/diagnostics/diagnostic_sanitizer.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../core/storage/token_storage.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/models/auth_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioProvider),
    ref.watch(tokenStorageProvider),
  );
});

class AuthRepository {
  AuthRepository(this._dio, this._storage);

  final Dio _dio;
  final TokenStorage _storage;

  /// Calls Nest `POST /auth/login` with LoginDto (email|phone, password, client).
  Future<AuthResponseModel> login({
    required String loginId,
    required String password,
  }) async {
    final started = DateTime.now();
    final requestId = DiagnosticLog.instance.nextRequestId();
    final payload = buildLoginPayload(loginId, password);
    final fieldNames = DiagnosticSanitizer.payloadFieldNames(payload);

    DiagnosticLog.instance.log(
      requestId: requestId,
      stage: 'login_start',
      message:
          'method=POST path=${ApiPaths.authLogin} '
          'base=${AppConfig.normalizedApiBaseUrl} '
          'payloadFields=$fieldNames '
          'connectTimeout=${AppConfig.connectTimeout.inSeconds}s '
          'receiveTimeout=${AppConfig.receiveTimeout.inSeconds}s '
          'sendTimeout=null',
    );

    try {
      final res = await _dio.post<Map<String, dynamic>>(
        ApiPaths.authLogin,
        data: payload,
        options: Options(
          // Login body is tiny; avoid Dio Android false sendTimeouts.
          sendTimeout: null,
          receiveTimeout: AppConfig.receiveTimeout,
          persistentConnection: false,
          // Connection: close is ignored on HTTP/2; real fix is ALPN http/1.1
          // in http_adapter_io.dart. Keep the header for HTTP/1.1 sessions.
          headers: const {'Connection': 'close'},
          validateStatus: (status) =>
              status != null && status >= 200 && status < 300,
          extra: {'diag_request_id': requestId},
        ),
      );
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_http_ok',
        message: 'status=${res.statusCode}',
        elapsedMs: elapsedMs,
      );
      debugPrint(
        '[AUTH LOGIN] ok status=${res.statusCode} elapsedMs=$elapsedMs',
      );

      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_parse_start',
        message: 'parsing AuthResponseModel (no body logged)',
        elapsedMs: elapsedMs,
      );
      final data = res.data;
      if (data == null) {
        DiagnosticLog.instance.log(
          requestId: requestId,
          stage: 'login_parse_fail',
          message: 'empty JSON body',
          elapsedMs: elapsedMs,
          failureClass: DiagnosticFailureClass.parse,
        );
        throw Exception('Bo\'sh javob (HTTP ${res.statusCode})');
      }
      final auth = AuthResponseModel.fromJson(data);
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_parse_ok',
        message: 'role=${auth.user.isSuperAdmin ? "SUPER_ADMIN" : "OTHER"}',
        elapsedMs: DateTime.now().difference(started).inMilliseconds,
      );
      if (!auth.user.isSuperAdmin) {
        DiagnosticLog.instance.log(
          requestId: requestId,
          stage: 'login_role_reject',
          message: 'non SUPER_ADMIN',
          failureClass: DiagnosticFailureClass.httpClientError,
        );
        throw Exception(AppStrings.wrongRole);
      }
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_storage_start',
        message: 'secure storage write starting',
        elapsedMs: DateTime.now().difference(started).inMilliseconds,
      );
      await _persist(auth);
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_storage_ok',
        message: 'session persisted',
        elapsedMs: DateTime.now().difference(started).inMilliseconds,
      );
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_success',
        message: 'auth complete — router should leave login',
        elapsedMs: DateTime.now().difference(started).inMilliseconds,
      );
      return auth;
    } on DioException catch (e) {
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
      final cls = DiagnosticClassifier.fromDio(e);
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_dio_error',
        message:
            'type=${e.type} status=${e.response?.statusCode} '
            'errorClass=${e.error?.runtimeType}',
        elapsedMs: elapsedMs,
        failureClass: cls,
      );
      debugPrint(
        '[AUTH LOGIN] dio type=${e.type} status=${e.response?.statusCode} '
        'elapsedMs=$elapsedMs',
      );
      rethrow;
    } catch (e) {
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
      final cls = DiagnosticClassifier.fromObject(e);
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'login_error',
        message: 'type=${e.runtimeType}',
        elapsedMs: elapsedMs,
        failureClass: cls,
      );
      debugPrint(
        '[AUTH LOGIN] error type=${e.runtimeType} elapsedMs=$elapsedMs',
      );
      rethrow;
    }
  }

  /// Builds payload matching backend LoginDto: email OR phone + password + client.
  static Map<String, dynamic> buildLoginPayload(String loginId, String password) {
    final id = loginId.trim();
    final client = AppConfig.clientId;
    if (id.contains('@')) {
      return {
        'email': id.toLowerCase(),
        'password': password,
        'client': client,
      };
    }
    return {
      'phone': normalizePhone(id),
      'password': password,
      'client': client,
    };
  }

  Future<AuthUserModel?> currentUser() async {
    final json = await _storage.getUserJson();
    if (json == null) return null;
    final user = AuthUserModel.fromJson(jsonDecode(json) as Map<String, dynamic>);
    if (!user.isSuperAdmin) {
      await _storage.clear();
      return null;
    }
    final token = await _storage.getAccessToken();
    if (token == null || token.isEmpty) {
      await _storage.clear();
      return null;
    }
    return user;
  }

  Future<void> logout() async {
    await _storage.clear();
  }

  Future<void> _persist(AuthResponseModel auth) async {
    await _storage.saveSession(
      accessToken: auth.accessToken,
      userJson: jsonEncode(auth.user.toJson()),
    );
  }

  /// Unauthenticated GET /health connectivity probe (no secrets).
  Future<void> probeHealth({required String requestId}) async {
    final started = DateTime.now();
    final url = '${AppConfig.normalizedApiBaseUrl}${ApiPaths.health}';
    DiagnosticLog.instance.log(
      requestId: requestId,
      stage: 'health_start',
      message: 'GET $url',
    );
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        ApiPaths.health,
        options: Options(
          sendTimeout: null,
          receiveTimeout: AppConfig.receiveTimeout,
          persistentConnection: false,
          headers: const {'Connection': 'close'},
          validateStatus: (status) =>
              status != null && status >= 200 && status < 500,
          extra: {'diag_request_id': requestId},
        ),
      );
      final ms = DateTime.now().difference(started).inMilliseconds;
      final statusLabel = res.data?['status'];
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'health_ok',
        message:
            'http=${res.statusCode} appStatus=$statusLabel '
            '(connectivity only — not login proof)',
        elapsedMs: ms,
      );
    } on DioException catch (e) {
      final ms = DateTime.now().difference(started).inMilliseconds;
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'health_fail',
        message: 'type=${e.type} status=${e.response?.statusCode}',
        elapsedMs: ms,
        failureClass: DiagnosticClassifier.fromDio(e),
      );
      rethrow;
    }
  }
}
