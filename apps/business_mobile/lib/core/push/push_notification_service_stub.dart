import 'package:flutter/foundation.dart';
import 'push_notification_service.dart';

class PushNotificationServiceStub implements PushNotificationService {
  @override
  Future<void> initialize() async {
    debugPrint('Business push: noop transport (Firebase disabled)');
  }

  @override
  Future<String?> getDeviceToken() async => null;

  @override
  void onForegroundMessage(void Function(Map<String, dynamic> data) handler) {}

  @override
  void onNotificationTap(void Function(Map<String, dynamic> data) handler) {}

  @override
  void onTokenRefresh(void Function(String token) handler) {}

  @override
  Future<Map<String, dynamic>?> getInitialNotificationData() async => null;
}
