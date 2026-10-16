import 'dart:convert';
import 'package:dio/dio.dart';
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
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.authLogin,
      data: buildLoginPayload(loginId, password),
    );
    final auth = AuthResponseModel.fromJson(res.data!);
    if (!auth.user.isSuperAdmin) {
      throw Exception(AppStrings.wrongRole);
    }
    await _persist(auth);
    return auth;
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
