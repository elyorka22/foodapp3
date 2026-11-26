import 'routes.dart';

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
