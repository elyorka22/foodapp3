import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/push/device_registration_service.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../core/storage/token_storage.dart';

final accountDeletionRepositoryProvider = Provider<AccountDeletionRepository>((ref) {
  return AccountDeletionRepository(
    ref.watch(dioProvider),
    ref.watch(tokenStorageProvider),
    ref.watch(deviceRegistrationServiceProvider),
  );
});

class AccountDeletionRepository {
  AccountDeletionRepository(this._dio, this._storage, this._devices);

  final Dio _dio;
  final TokenStorage _storage;
  final DeviceRegistrationService _devices;

  Future<String> requestDeletion({
    required String phone,
    String? email,
    String? reason,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.accountDeleteRequest,
      data: {
        'phone': phone,
        if (email != null && email.isNotEmpty) 'email': email,
        if (reason != null && reason.isNotEmpty) 'reason': reason,
      },
    );
    final message = res.data?['message'] as String?;
    return message ?? 'Account deleted';
  }

  Future<void> deleteAccountAndLogout({required String phone}) async {
    await requestDeletion(phone: phone);
    await _devices.unregisterOnLogout();
    await _storage.clear();
  }
}
