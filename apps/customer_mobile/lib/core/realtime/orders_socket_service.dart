import '../config/app_config.dart';

/// Socket.IO client for `namespace: /orders` (see backend OrdersGateway).
///
/// **Current:** order tracking uses HTTP polling via [orderTrackingProvider].
/// **Future:** connect here, `emit('joinOrder', trackingToken)`, listen `orderUpdated`.
abstract class OrdersSocketService {
  Future<void> connect({String? authToken});
  Future<void> joinOrder(String trackingToken);
  void onOrderUpdated(void Function(Map<String, dynamic> payload) handler);
  Future<void> disconnect();
}

class OrdersSocketServiceStub implements OrdersSocketService {
  @override
  Future<void> connect({String? authToken}) async {
    // IO.io('${AppConfig.wsBaseUrl}/orders', OptionBuilder().setTransports(['websocket']).build())
  }

  @override
  Future<void> joinOrder(String trackingToken) async {}

  @override
  void onOrderUpdated(void Function(Map<String, dynamic> payload) handler) {}

  @override
  Future<void> disconnect() async {}
}

String get ordersSocketUrl => '${AppConfig.wsBaseUrl}/orders';
