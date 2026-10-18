import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/audit/presentation/audit_screen.dart';
import '../../features/booking/presentation/booking_screen.dart';
import '../../features/business_types/presentation/business_types_screen.dart';
import '../../features/businesses/presentation/businesses_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/cities/presentation/cities_screen.dart';
import '../../features/couriers/presentation/couriers_screen.dart';
import '../../features/customers/presentation/customers_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/delivery_zones/presentation/delivery_zones_screen.dart';
import '../../features/diagnostics/presentation/diagnostics_screen.dart';
import '../../features/employees/presentation/employees_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/promotions/presentation/promotions_screen.dart';
import '../../features/push/presentation/push_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/shell/control_shell_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import 'routes.dart';

final _rootKey = GlobalKey<NavigatorState>();

/// Auth gate for Control routes.
///
/// While [isLoading] is true, stay on the current page (do not bounce login →
/// splash). That keeps the login form mounted so API errors remain visible.
/// Diagnostics is reachable before login.
String? resolveControlAuthRedirect({
  required String location,
  required bool isLoading,
  required bool loggedIn,
}) {
  final onSplash = location == AppRoutes.splash;
  final onLogin = location == AppRoutes.login;
  final onDiagnostics = location == AppRoutes.diagnostics;

  if (isLoading) {
    return null;
  }

  if (!loggedIn) {
    if (onLogin || onDiagnostics) return null;
    return AppRoutes.login;
  }

  if (onLogin || onSplash) {
    return AppRoutes.dashboard;
  }
  return null;
}

GoRoute _branch(String path, Widget child) {
  return GoRoute(path: path, builder: (_, __) => child);
}

final routerProvider = Provider<GoRouter>((ref) {
  // Do not watch authStateProvider here — that would recreate GoRouter on every
  // auth change and reset navigation (login form / errors would be lost).
  final router = GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final auth = ref.read(authStateProvider);
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
      GoRoute(
        path: AppRoutes.diagnostics,
        builder: (_, __) => const DiagnosticsScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ControlShellScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [_branch(AppRoutes.dashboard, const DashboardScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.employees, const EmployeesScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.businesses, const BusinessesScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.orders, const OrdersScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.catalog, const CatalogScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.promotions, const PromotionsScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.push, const PushScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.couriers, const CouriersScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.customers, const CustomersScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.cities, const CitiesScreen())],
          ),
          StatefulShellBranch(
            routes: [
              _branch(AppRoutes.deliveryZones, const DeliveryZonesScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              _branch(AppRoutes.businessTypes, const BusinessTypesScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.booking, const BookingScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.settings, const SettingsScreen())],
          ),
          StatefulShellBranch(
            routes: [_branch(AppRoutes.audit, const AuditScreen())],
          ),
        ],
      ),
    ],
  );

  ref.listen(authStateProvider, (_, __) => router.refresh());
  ref.onDispose(router.dispose);
  return router;
});
