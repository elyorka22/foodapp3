import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/cities/presentation/city_selector.dart';
import '../../features/notifications/providers/notifications_provider.dart';
import 'notification_bell.dart';

/// Matches web `home-center-header.tsx`: city left · notifications right.
class HomeHeadline extends ConsumerWidget {
  const HomeHeadline({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const SizedBox(
      height: 44,
      child: Row(
        children: [
          Expanded(
            child: Align(
              alignment: Alignment.centerLeft,
              child: CitySelector(),
            ),
          ),
          _BellButton(),
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
    final unread = user == null
        ? 0
        : ref.watch(notificationsUnreadProvider).valueOrNull ?? 0;

    return NotificationBell(
      unreadCount: unread,
      color: AppColors.textPrimary,
      size: 22,
      onTap: () {
        if (user == null) {
          context.push('/profile/login');
          return;
        }
        context.push(AppRoutes.notifications);
      },
    );
  }
}
