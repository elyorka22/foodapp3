import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';

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
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    try {
      final user = await ref.read(authStateProvider.future);
      if (!mounted) return;
      context.go(user != null ? AppRoutes.home : AppRoutes.login);
    } catch (_) {
      if (!mounted) return;
      context.go(AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.delivery_dining, size: 56, color: AppColors.primary),
            const SizedBox(height: 16),
            Text(AppStrings.appName, style: AppTypography.title),
          ],
        ),
      ),
    );
  }
}
