import 'package:flutter/foundation.dart';
import 'push_notification_service.dart';

/// No-op push transport — used when Firebase is not configured (CI / local dev).
/// In-app notification center still works via HTTP API.
class PushNotificationServiceStub implements PushNotificationService {
  @override
  Future<void> initialize() async {
    debugPrint('Push: noop transport (Firebase disabled)');
  }

  @override
  Future<String?> getDeviceToken() async => null;

  @override
  Future<void> subscribeToOrderUpdates(String orderId) async {}

  @override
  void onForegroundMessage(void Function(Map<String, dynamic> data) handler) {}

  @override
  void onNotificationTap(void Function(Map<String, dynamic> data) handler) {}

  @override
  void onTokenRefresh(void Function(String token) handler) {}

  @override
  Future<Map<String, dynamic>?> getInitialNotificationData() async => null;
}
