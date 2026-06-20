import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../router/routes.dart';

/// Maps FCM `data.route` / `orderId` to business app navigation.
Future<void> navigateFromPushData(
  GoRouter router,
  WidgetRef ref,
  Map<String, dynamic> data,
) async {
  final user = ref.read(authStateProvider).valueOrNull;
  final orderId = _resolveOrderId(data);

  if (orderId != null && orderId.isNotEmpty && user != null) {
    if (user.isRestaurant) {
      router.push(AppRoutes.restaurantOrderDetail(orderId));
    } else {
      router.go(user.homeRoute);
    }
    return;
  }

  router.push(AppRoutes.notifications);
}

String? _resolveOrderId(Map<String, dynamic> data) {
  final direct = data['orderId'] as String?;
  if (direct != null && direct.isNotEmpty) return direct;

  final route = data['route'] as String?;
  if (route != null && route.startsWith('/orders/')) {
    return route.replaceFirst('/orders/', '').trim();
  }
  return null;
}
