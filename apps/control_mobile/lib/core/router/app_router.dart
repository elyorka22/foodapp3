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

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);

  final router = GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoutes.splash,
    refreshListenable: _AuthRefresh(ref),
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final loggingIn = loc == AppRoutes.login || loc == AppRoutes.splash;

      if (auth.isLoading) {
        return loc == AppRoutes.splash ? null : AppRoutes.splash;
      }

      final user = auth.valueOrNull;
      final loggedIn = user != null && user.isSuperAdmin;

      if (!loggedIn && !loggingIn) return AppRoutes.login;
      if (loggedIn && loggingIn) return AppRoutes.dashboard;
      return null;
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
