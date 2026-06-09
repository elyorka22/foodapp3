import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../auth/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/food_app_logo.dart';

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

    try {
      final user = await ref.read(authStateProvider.future);
      if (!mounted) return;
      if (user?.needsPhone == true) {
        context.go(AppRoutes.completeProfile);
      } else {
        context.go(AppRoutes.restaurants);
      }
    } catch (_) {
      if (!mounted) return;
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
            const FoodAppLogo(size: 88, borderRadius: 24),
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
