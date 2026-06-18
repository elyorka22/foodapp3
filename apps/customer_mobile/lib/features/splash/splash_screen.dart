import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../shared/models/auth_model.dart';
import '../auth/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;

    CustomerUserModel? user;
    try {
      user = await ref.read(authStateProvider.future).timeout(
        const Duration(seconds: 3),
      );
    } catch (_) {
      user = ref.read(authStateProvider).valueOrNull;
    }

    if (!mounted) return;
    if (user?.needsPhone == true) {
      context.go(AppRoutes.completeProfile);
    } else {
      context.go(AppRoutes.restaurants);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryHover],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                'F',
                style: AppTypography.display.copyWith(
                  color: Colors.white,
                  fontSize: 40,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(AppStrings.appName, style: AppTypography.display),
            const SizedBox(height: 24),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            Text(AppStrings.loading, style: AppTypography.bodySmall),
          ],
        ),
      ),
    );
  }
}
