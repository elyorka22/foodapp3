import 'package:go_router/go_router.dart';
import '../router/routes.dart';

/// Maps FCM `data.route` (from backend) to in-app navigation.
void navigateFromPushData(GoRouter router, Map<String, dynamic> data) {
  final route = data['route'] as String?;
  if (route == null || route.isEmpty) {
    router.push(AppRoutes.notifications);
    return;
  }

  if (route.startsWith('/track/')) {
    final token = route.replaceFirst('/track/', '').trim();
    if (token.isNotEmpty) {
      router.push('${AppRoutes.orderTrack}/$token');
      return;
    }
  }

  if (route == '/promotions' || route.startsWith('/promotions')) {
    router.push(AppRoutes.promotions);
    return;
  }

  if (route == '/notifications') {
    router.push(AppRoutes.notifications);
    return;
  }

  router.push(AppRoutes.notifications);
}
