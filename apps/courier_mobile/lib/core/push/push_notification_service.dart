/// Push transport abstraction — FCM only; FoodApp backend owns notification logic.
abstract class PushNotificationService {
  Future<void> initialize();
  Future<String?> getDeviceToken();
  void onForegroundMessage(void Function(Map<String, dynamic> data) handler);
  void onNotificationTap(void Function(Map<String, dynamic> data) handler);
  void onTokenRefresh(void Function(String token) handler);
  Future<Map<String, dynamic>?> getInitialNotificationData();
}
