/// Push transport abstraction — FCM/APNs only; FoodApp backend owns notification logic.
abstract class PushNotificationService {
  Future<void> initialize();
  Future<String?> getDeviceToken();
  Future<void> subscribeToOrderUpdates(String orderId);
  void onForegroundMessage(void Function(Map<String, dynamic> data) handler);
  void onNotificationTap(void Function(Map<String, dynamic> data) handler);
  void onTokenRefresh(void Function(String token) handler);
  Future<Map<String, dynamic>?> getInitialNotificationData();
}
