import 'package:go_router/go_router.dart';
import '../router/routes.dart';

/// Maps FCM `data.route` / `orderId` (from backend) to courier navigation.
void navigateFromPushData(GoRouter router, Map<String, dynamic> data) {
  final orderId = data['orderId'] as String?;
  if (orderId != null && orderId.isNotEmpty) {
    router.push(AppRoutes.incomingOrder, extra: orderId);
    return;
  }

  final route = data['route'] as String?;
  if (route != null && route.startsWith('/orders/')) {
    final id = route.replaceFirst('/orders/', '').trim();
    if (id.isNotEmpty) {
      router.push(AppRoutes.incomingOrder, extra: id);
      return;
    }
  }

  router.push(AppRoutes.notifications);
}
