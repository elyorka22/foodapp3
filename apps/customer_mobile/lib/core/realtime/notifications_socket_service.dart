import '../config/app_config.dart';

/// Socket.IO client for namespace `/notifications` — live notification center updates.
abstract class NotificationsSocketService {
  Future<void> connect({required String authToken});
  void onNotification(void Function(Map<String, dynamic> payload) handler);
  Future<void> disconnect();
}

class NotificationsSocketServiceStub implements NotificationsSocketService {
  @override
  Future<void> connect({required String authToken}) async {}

  @override
  void onNotification(void Function(Map<String, dynamic> payload) handler) {}

  @override
  Future<void> disconnect() async {}
}

String get notificationsSocketUrl => '${AppConfig.normalizedWsBaseUrl}/notifications';
