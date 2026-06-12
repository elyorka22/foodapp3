import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  Future<AuthResponseModel> login({
    required String loginId,
    required String password,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.authLogin,
      data: _buildLoginPayload(loginId, password),
    );
    final auth = AuthResponseModel.fromJson(res.data!);
    if (!auth.user.isRestaurant && !auth.user.isManager) {
      throw Exception(AppStrings.wrongRole);
    }
    await _persist(auth);
    return auth;
  }

  Future<AuthUserModel?> currentUser() async {
    final json = await _storage.getUserJson();
    if (json == null) return null;
    final user = AuthUserModel.fromJson(jsonDecode(json) as Map<String, dynamic>);
    if (!user.isRestaurant && !user.isManager) {
      await _storage.clear();
      return null;
    }
    return user;
  }

  Future<void> logout() async {
    await _storage.clear();
  }

  Map<String, dynamic> _buildLoginPayload(String loginId, String password) {
    final id = loginId.trim();
    if (id.contains('@')) {
      return {'email': id.toLowerCase(), 'password': password};
    }
    return {'phone': normalizePhone(id), 'password': password};
  }

  Future<void> _persist(AuthResponseModel auth) async {
    await _storage.saveSession(
      accessToken: auth.accessToken,
      userJson: jsonEncode(auth.user.toJson()),
    );
  }
}
