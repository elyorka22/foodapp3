import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/push/device_registration_service.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../core/storage/token_storage.dart';
import '../../../shared/models/auth_model.dart';
import 'google_auth_service.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioProvider),
    ref.watch(tokenStorageProvider),
    ref.watch(deviceRegistrationServiceProvider),
    ref.watch(googleAuthServiceProvider),
  );
});

class AuthRepository {
  AuthRepository(this._dio, this._storage, this._devices, this._googleAuth);

  final Dio _dio;
  final TokenStorage _storage;
  final DeviceRegistrationService _devices;
  final GoogleAuthService _googleAuth;

  Future<AuthResponseModel> loginPhone({
    required String phone,
    String? password,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.customersLogin,
      data: {
        'phone': phone,
        if (password != null && password.isNotEmpty) 'password': password,
      },
    );
    final model = AuthResponseModel.fromJson(res.data!);
    await _persist(model);
    return model;
  }

  Future<AuthResponseModel> register({
    required String phone,
    required String fullName,
    String? email,
    String? password,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.customersRegister,
      data: {
        'phone': phone,
        'fullName': fullName,
        if (email != null) 'email': email,
        if (password != null) 'password': password,
      },
    );
    final model = AuthResponseModel.fromJson(res.data!);
    await _persist(model);
    return model;
  }

  Future<AuthResponseModel> loginGoogle() async {
    final idToken = await _googleAuth.signInAndGetIdToken();
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.authGoogle,
      data: {'idToken': idToken},
    );
    final model = AuthResponseModel.fromJson(res.data!);
    await _persist(model);
    return model;
  }

  Future<AuthResponseModel> loginTelegram(TelegramAuthPayload payload) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.authTelegram,
      data: payload.toJson(),
    );
    final model = AuthResponseModel.fromJson(res.data!);
    await _persist(model);
    return model;
  }

  Future<CustomerUserModel?> currentUser() async {
    final json = await _storage.getUserJson();
    if (json == null) return null;
    return CustomerUserModel.fromJson(
      Map<String, dynamic>.from(jsonDecode(json) as Map),
    );
  }

  Future<CustomerUserModel?> fetchMe() async {
    final token = await _storage.getAccessToken();
    if (token == null) return null;
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.customersMe);
    final raw = res.data!['user'] ?? res.data;
    final user = CustomerUserModel.fromJson(
      Map<String, dynamic>.from(raw as Map),
    );
    await _storage.saveSession(
      accessToken: token,
      userJson: jsonEncode(user.toJson()),
    );
    return user;
  }

  Future<AuthResponseModel> completeProfile({
    required String phone,
    String? deliveryAddress,
    double? latitude,
    double? longitude,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.customersCompleteProfile,
      data: {
        'phone': phone,
        if (deliveryAddress != null) 'deliveryAddress': deliveryAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
      },
    );
    final model = AuthResponseModel.fromJson(res.data!);
    await _persist(model);
    return model;
  }

  Future<void> logout() async {
    await _devices.unregisterOnLogout();
    await _storage.clear();
  }

  Future<void> _persist(AuthResponseModel model) async {
    await _storage.saveSession(
      accessToken: model.accessToken,
      userJson: jsonEncode(model.user.toJson()),
    );
    await _devices.registerAfterAuth();
  }
}
