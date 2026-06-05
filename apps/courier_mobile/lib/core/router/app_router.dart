import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/orders/presentation/active_order_screen.dart';
import '../../features/orders/presentation/incoming_order_screen.dart';
import '../../features/orders/presentation/order_complete_screen.dart';
import '../../features/orders/presentation/order_history_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import 'routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final loggedIn = auth.valueOrNull != null;
      final onLogin = state.matchedLocation == AppRoutes.login;
      final onSplash = state.matchedLocation == AppRoutes.splash;
      if (!loggedIn && !onLogin && !onSplash) return AppRoutes.login;
      if (loggedIn && (onLogin || onSplash)) return AppRoutes.home;
      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
      GoRoute(path: AppRoutes.home, builder: (_, __) => const HomeScreen()),
      GoRoute(
        path: AppRoutes.incomingOrder,
        builder: (_, state) => IncomingOrderScreen(orderId: state.extra as String),
      ),
      GoRoute(
        path: AppRoutes.activeOrder,
        builder: (_, state) => ActiveOrderScreen(orderId: state.extra as String),
      ),
      GoRoute(path: AppRoutes.orderComplete, builder: (_, __) => const OrderCompleteScreen()),
      GoRoute(path: AppRoutes.profile, builder: (_, __) => const ProfileScreen()),
      GoRoute(path: AppRoutes.notifications, builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: AppRoutes.orderHistory, builder: (_, __) => const OrderHistoryScreen()),
    ],
  );
});
