import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/router/routes.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/cities/presentation/city_selector.dart';
import '../../core/theme/app_colors.dart';

/// Matches web `home-center-header.tsx`: menu · centered city · notifications.
class HomeHeadline extends ConsumerWidget {
  const HomeHeadline({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 44,
      child: Stack(
        alignment: Alignment.center,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 52),
            child: CitySelector(centered: true),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              onPressed: () => context.go(AppRoutes.profile),
              icon: const Icon(Icons.menu_rounded, size: 26),
              color: AppColors.textPrimary,
            ),
          ),
          const Align(
            alignment: Alignment.centerRight,
            child: _BellButton(),
          ),
        ],
      ),
    );
  }
}

class _BellButton extends ConsumerWidget {
  const _BellButton();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;

    return IconButton(
      onPressed: () {
        if (user == null) {
          context.push('/profile/login');
          return;
        }
        context.push(AppRoutes.notifications);
      },
      icon: const Icon(Icons.notifications_none_rounded, size: 24),
      color: AppColors.textPrimary,
    );
  }
}
