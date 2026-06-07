import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../features/notifications/data/device_registration_repository.dart';
import '../network/dio_client.dart';
import '../storage/storage_providers.dart';
import '../storage/token_storage.dart';
import 'device_id_storage.dart';
import 'notification_permissions.dart';
import 'push_notification_service.dart';
import 'push_providers.dart';

final deviceRegistrationRepositoryProvider = Provider<DeviceRegistrationRepository>((ref) {
  return DeviceRegistrationRepository(ref.watch(dioProvider));
});

final deviceIdStorageProvider = Provider<DeviceIdStorage>((ref) {
  return DeviceIdStorage(ref.watch(sharedPreferencesProvider));
});

final deviceRegistrationServiceProvider = Provider<DeviceRegistrationService>((ref) {
  return DeviceRegistrationService(
    ref.watch(deviceRegistrationRepositoryProvider),
    ref.watch(deviceIdStorageProvider),
    ref.watch(pushNotificationServiceProvider),
    ref.watch(tokenStorageProvider),
  );
});

/// Registers FCM token on install (guest) and links to account after login.
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

  Future<String> getDeviceId() => _deviceIdStorage.getOrCreate();

  /// Called on every app start — no login required.
  Future<void> registerOnLaunch() async {
    try {
      await _push.initialize();
      final pushToken = await _resolvePushToken();
      if (pushToken == null) {
        debugPrint('Guest device registration skipped: no FCM token (enable notifications in settings)');
        return;
      }

      final deviceId = await _deviceIdStorage.getOrCreate();
      final info = await PackageInfo.fromPlatform();
      final platform = _platformName();

      await _repository.registerGuest(
        deviceId: deviceId,
        platform: platform,
        pushToken: pushToken,
        appVersion: info.version,
      );
      _bindTokenRefresh(deviceId, platform, info.version, guest: true);
    } catch (e, st) {
      debugPrint('Guest device registration failed: $e\n$st');
    }
  }

  Future<void> registerAfterAuth() async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) return;

    try {
      await _push.initialize();
      final pushToken = await _resolvePushToken();
      if (pushToken == null) {
        debugPrint('Auth device registration skipped: no FCM token (enable notifications in settings)');
        return;
      }

      final deviceId = await _deviceIdStorage.getOrCreate();
      final info = await PackageInfo.fromPlatform();
      final platform = _platformName();

      await _repository.register(
        deviceId: deviceId,
        platform: platform,
        pushToken: pushToken,
        appVersion: info.version,
      );
      _bindTokenRefresh(deviceId, platform, info.version, guest: false);
    } catch (e, st) {
      debugPrint('Device registration failed: $e\n$st');
    }
  }

  Future<void> syncGuestPhone(String phone) async {
    if (phone.trim().isEmpty) return;
    try {
      await _push.initialize();
      final pushToken = await _resolvePushToken();
      if (pushToken == null) return;

      final deviceId = await _deviceIdStorage.getOrCreate();
      final info = await PackageInfo.fromPlatform();
      await _repository.registerGuest(
        deviceId: deviceId,
        platform: _platformName(),
        pushToken: pushToken,
        appVersion: info.version,
        phone: phone.trim(),
      );
    } catch (e) {
      debugPrint('Guest phone sync failed: $e');
    }
  }

  Future<void> unregisterOnLogout() async {
    try {
      final deviceId = await _deviceIdStorage.getOrCreate();
      await _repository.unregister(
        deviceId: deviceId,
        platform: _platformName(),
      );
      await registerOnLaunch();
    } catch (e) {
      debugPrint('Device unregister failed: $e');
    }
  }

  void _bindTokenRefresh(
    String deviceId,
    String platform,
    String appVersion, {
    required bool guest,
  }) {
    _push.onTokenRefresh((token) async {
      if (guest) {
        await _repository.registerGuest(
          deviceId: deviceId,
          platform: platform,
          pushToken: token,
          appVersion: appVersion,
        );
        return;
      }
      final accessToken = await _tokenStorage.getAccessToken();
      if (accessToken == null || accessToken.isEmpty) {
        await _repository.registerGuest(
          deviceId: deviceId,
          platform: platform,
          pushToken: token,
          appVersion: appVersion,
        );
        return;
      }
      await _repository.register(
        deviceId: deviceId,
        platform: platform,
        pushToken: token,
        appVersion: appVersion,
      );
    });
  }

  String _platformName() {
    if (kIsWeb) return 'web';
    if (Platform.isIOS) return 'ios';
    return 'android';
  }

  /// Waits for OS permission, then returns FCM token — null if notifications are blocked.
  Future<String?> _resolvePushToken() async {
    if (!await hasPushNotificationPermission()) {
      await requestPushNotificationPermissions();
    }
    if (!await hasPushNotificationPermission()) return null;

    final token = await _push.getDeviceToken();
    if (token == null || token.isEmpty) return null;
    return token;
  }
}
