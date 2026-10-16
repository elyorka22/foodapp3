import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/app_config.dart';
import '../../../core/constants/api_paths.dart';
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
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        ApiPaths.authLogin,
        data: buildLoginPayload(loginId, password),
        options: Options(
          // Login body is tiny; avoid Dio Android false sendTimeouts.
          sendTimeout: null,
          receiveTimeout: AppConfig.receiveTimeout,
          persistentConnection: false,
          // Close after one response so nginx/h2 cannot leave the stream open.
          headers: const {'Connection': 'close'},
          validateStatus: (status) =>
              status != null && status >= 200 && status < 300,
        ),
      );
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
      debugPrint(
        '[AUTH LOGIN] ok status=${res.statusCode} elapsedMs=$elapsedMs',
      );

      final data = res.data;
      if (data == null) {
        throw Exception('Bo\'sh javob (HTTP ${res.statusCode})');
      }
      final auth = AuthResponseModel.fromJson(data);
      if (!auth.user.isSuperAdmin) {
        throw Exception(AppStrings.wrongRole);
      }
      await _persist(auth);
      return auth;
    } on DioException catch (e) {
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
      debugPrint(
        '[AUTH LOGIN] dio type=${e.type} status=${e.response?.statusCode} '
        'elapsedMs=$elapsedMs',
      );
      rethrow;
    } catch (e) {
      final elapsedMs = DateTime.now().difference(started).inMilliseconds;
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
}
