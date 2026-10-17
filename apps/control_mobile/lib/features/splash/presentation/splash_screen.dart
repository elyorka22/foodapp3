import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';

/// Boots into login/dashboard. Has a hard timeout so a hung auth restore
/// cannot leave the user on the Flutter / splash forever.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  Timer? _bailout;

  @override
  void initState() {
    super.initState();
    _bailout = Timer(const Duration(seconds: 8), () {
      if (!mounted) return;
      final loc = GoRouterState.of(context).matchedLocation;
      if (loc != AppRoutes.splash) return;
      final auth = ref.read(authStateProvider);
      if (auth.isLoading) {
        // Force leave splash even if AsyncNotifier is still pending.
        context.go(AppRoutes.login);
      }
    });
  }

  @override
  void dispose() {
    _bailout?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.sidebar,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              AppStrings.appName,
              style: AppTypography.display.copyWith(color: AppColors.onSidebar),
            ),
            const SizedBox(height: 8),
            Text(
              AppStrings.splashLoading,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.onSidebarMuted,
              ),
            ),
            const SizedBox(height: 24),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
