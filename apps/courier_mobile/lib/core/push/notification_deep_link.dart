import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/orders/data/courier_repository.dart';
import '../router/routes.dart';

/// Maps FCM `data.route` / `orderId` (from backend) to courier navigation.
Future<void> navigateFromPushData(
  GoRouter router,
  WidgetRef ref,
  Map<String, dynamic> data,
) async {
  String? orderId = data['orderId'] as String?;

  final route = data['route'] as String?;
  if ((orderId == null || orderId.isEmpty) && route != null && route.startsWith('/orders/')) {
    orderId = route.replaceFirst('/orders/', '').trim();
  }

  if (orderId != null && orderId.isNotEmpty) {
    try {
      final order = await ref.read(courierRepositoryProvider).fetchOrder(orderId);
      if (order.isActive || order.needsCourierAcceptance) {
        router.push(AppRoutes.activeOrder, extra: orderId);
      } else {
        router.push(AppRoutes.incomingOrder, extra: orderId);
      }
    } catch (_) {
      router.push(AppRoutes.incomingOrder, extra: orderId);
    }
    return;
  }

  router.push(AppRoutes.notifications);
}
