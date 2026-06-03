import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../features/notifications/data/device_registration_repository.dart';
import '../network/dio_client.dart';
import '../storage/storage_providers.dart';
import '../storage/token_storage.dart';
import 'device_id_storage.dart';
import 'push_notification_service.dart';
import 'push_providers.dart';

final deviceRegistrationRepositoryProvider = Provider<DeviceRegistrationRepository>((ref) {
  return DeviceRegistrationRepository(ref.watch(dioProvider));
});

final deviceRegistrationServiceProvider = Provider<DeviceRegistrationService>((ref) {
  return DeviceRegistrationService(
    ref.watch(deviceRegistrationRepositoryProvider),
    DeviceIdStorage(ref.watch(sharedPreferencesProvider)),
    ref.watch(pushNotificationServiceProvider),
    ref.watch(tokenStorageProvider),
  );
});

/// Registers install + FCM token in FoodApp `user_devices` after login.
class DeviceRegistrationService {
  DeviceRegistrationService(
    this._repository,
    this._deviceIdStorage,
    this._push,
    this._tokenStorage,
  );

  final DeviceRegistrationRepository _repository;
  final DeviceIdStorage _deviceIdStorage;
  final PushNotificationService _push;
  final TokenStorage _tokenStorage;

  Future<void> registerAfterAuth() async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) return;

    try {
      final deviceId = await _deviceIdStorage.getOrCreate();
      final pushToken = await _push.getDeviceToken();
      final info = await PackageInfo.fromPlatform();
      final platform = _platformName();

      await _repository.register(
        deviceId: deviceId,
        platform: platform,
        pushToken: pushToken,
        appVersion: info.version,
      );
      _push.onTokenRefresh((token) async {
        await _repository.register(
          deviceId: deviceId,
          platform: platform,
          pushToken: token,
          appVersion: info.version,
        );
      });
    } catch (e, st) {
      debugPrint('Device registration failed: $e\n$st');
    }
  }

  Future<void> unregisterOnLogout() async {
    try {
      final deviceId = await _deviceIdStorage.getOrCreate();
      await _repository.unregister(
        deviceId: deviceId,
        platform: _platformName(),
      );
    } catch (e) {
      debugPrint('Device unregister failed: $e');
    }
  }

  String _platformName() {
    if (kIsWeb) return 'web';
    if (Platform.isIOS) return 'ios';
    return 'android';
  }
}
