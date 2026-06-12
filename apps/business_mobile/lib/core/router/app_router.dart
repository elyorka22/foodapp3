import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/manager/presentation/manager_courier_form_screen.dart';
import '../../features/manager/presentation/manager_couriers_screen.dart';
import '../../features/manager/presentation/manager_orders_screen.dart';
import '../../features/manager/presentation/manager_restaurant_form_screen.dart';
import '../../features/manager/presentation/manager_restaurants_screen.dart' show ManagerRestaurantsScreen, ManagerStoresScreen;
import '../../features/menu/presentation/menu_screen.dart';
import '../../features/menu/presentation/product_form_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/restaurant/presentation/restaurant_orders_screen.dart';
import '../../features/restaurant/presentation/restaurant_stats_screen.dart';
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
      GoRoute(
        path: AppRoutes.notifications,
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.productForm,
        builder: (_, state) {
          final extra = state.extra;
          if (extra is ProductFormArgs) {
            return ProductFormScreen(args: extra);
          }
          return const Scaffold(body: Center(child: Text('Invalid product form')));
        },
      ),
      GoRoute(
        path: AppRoutes.managerRestaurantNew,
        builder: (_, __) => const ManagerRestaurantFormScreen(),
      ),
      GoRoute(
        path: '/manager/restaurants/:id/edit',
        builder: (_, state) => ManagerRestaurantFormScreen(
          restaurantId: state.pathParameters['id'],
        ),
      ),
      GoRoute(
        path: '/manager/restaurants/:id/menu',
        builder: (_, state) => MenuScreen(
          restaurantId: state.pathParameters['id'],
        ),
      ),
      GoRoute(
        path: AppRoutes.managerCourierNew,
        builder: (_, __) => const ManagerCourierFormScreen(),
      ),
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
                path: AppRoutes.restaurantMenu,
                builder: (_, __) => const MenuScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.restaurantStats,
                builder: (_, __) => const RestaurantStatsScreen(),
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
                path: AppRoutes.managerRestaurants,
                builder: (_, __) => const ManagerRestaurantsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.managerStores,
                builder: (_, __) => const ManagerStoresScreen(),
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
