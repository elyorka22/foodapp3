import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/manager/presentation/manager_couriers_screen.dart';
import '../../features/manager/presentation/manager_orders_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/restaurant/presentation/restaurant_orders_screen.dart';
import '../../features/shell/manager_shell_screen.dart';
import '../../features/shell/restaurant_shell_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import 'routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final auth = ref.read(authStateProvider);
      if (auth.isLoading) return null;

      final user = auth.valueOrNull;
      final location = state.matchedLocation;
      final onLogin = location == AppRoutes.login;
      final onSplash = location == AppRoutes.splash;

      if (user != null) {
        final home = user.homeRoute;
        if (onLogin || onSplash) return home;
        if (user.isRestaurant && location.startsWith('/manager')) return home;
        if (user.isManager && location.startsWith('/restaurant')) return home;
        return null;
      }

      if (!onLogin && !onSplash) return AppRoutes.login;
      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) =>
            RestaurantShellScreen(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.restaurantHome,
                builder: (_, __) => const RestaurantOrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.restaurantProfile,
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) =>
            ManagerShellScreen(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.managerHome,
                builder: (_, __) => const ManagerOrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.managerCouriers,
                builder: (_, __) => const ManagerCouriersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.managerProfile,
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  ref.listen(authStateProvider, (_, __) => router.refresh());
  ref.onDispose(router.dispose);
  return router;
});
