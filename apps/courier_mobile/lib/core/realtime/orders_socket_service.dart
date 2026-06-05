import '../config/app_config.dart';

/// Placeholder for future WebSocket order assignment.
/// Connect with JWT, join courier room, listen for `assignment` events.
class OrdersSocketService {
  OrdersSocketService._();

  static final OrdersSocketService instance = OrdersSocketService._();

  bool get isConfigured => AppConfig.wsBaseUrl.trim().isNotEmpty;

  Future<void> connect({required String token, required String courierId}) async {
    // Future: socket_io_client connect to WS_BASE_URL/orders
    // emit joinCourier(courierId)
    // on assignment -> navigate to incoming order screen
  }

  Future<void> disconnect() async {}
}
