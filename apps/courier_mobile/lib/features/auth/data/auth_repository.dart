import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/utils/phone_util.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../core/storage/token_storage.dart';
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
    required String phone,
    required String password,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.authLogin,
      data: {'phone': normalizePhone(phone), 'password': password},
    );
    final auth = AuthResponseModel.fromJson(res.data!);
    if (auth.user.role != 'COURIER') {
      throw Exception('Faqat kuryer hisobi bilan kirish mumkin');
    }
    await _storage.saveSession(
      accessToken: auth.accessToken,
      userJson: jsonEncode(auth.user.toJson()),
    );
    return auth;
  }

  Future<AuthUserModel?> currentUser() async {
    final json = await _storage.getUserJson();
    if (json == null) return null;
    return AuthUserModel.fromJson(jsonDecode(json) as Map<String, dynamic>);
  }

  Future<void> logout() => _storage.clear();
}
