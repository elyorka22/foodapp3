import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/audit/presentation/audit_screen.dart';
import '../../features/businesses/presentation/businesses_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/employees/presentation/employees_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/promotions/presentation/promotions_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/shell/control_shell_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import 'routes.dart';

final _rootKey = GlobalKey<NavigatorState>();

/// Auth gate for Control routes. Splash must not trap users after restore finishes.
String? resolveControlAuthRedirect({
  required String location,
  required bool isLoading,
  required bool loggedIn,
}) {
  final onSplash = location == AppRoutes.splash;
  final onLogin = location == AppRoutes.login;

  if (isLoading) {
    return onSplash ? null : AppRoutes.splash;
  }

  if (!loggedIn) {
    return onLogin ? null : AppRoutes.login;
  }

  if (onLogin || onSplash) {
    return AppRoutes.dashboard;
  }
  return null;
}

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);

  final router = GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoutes.splash,
    refreshListenable: _AuthRefresh(ref),
    redirect: (context, state) {
      final user = auth.valueOrNull;
      return resolveControlAuthRedirect(
        location: state.matchedLocation,
        isLoading: auth.isLoading,
        loggedIn: user != null && user.isSuperAdmin,
      );
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (_, __) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ControlShellScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.dashboard,
                builder: (_, __) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.employees,
                builder: (_, __) => const EmployeesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.businesses,
                builder: (_, __) => const BusinessesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.orders,
                builder: (_, __) => const OrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.catalog,
                builder: (_, __) => const CatalogScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.promotions,
                builder: (_, __) => const PromotionsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.settings,
                builder: (_, __) => const SettingsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.audit,
                builder: (_, __) => const AuditScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});

class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(this._ref) {
    _ref.listen(authStateProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}
