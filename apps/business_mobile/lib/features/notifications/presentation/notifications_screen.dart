import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/notifications_repository.dart';
import '../../../core/utils/safe_area_padding.dart';

final notificationsListProvider =
    FutureProvider.autoDispose<List<NotificationItem>>((ref) async {
  return ref.read(notificationsRepositoryProvider).fetchList();
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.notifications),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(notificationsRepositoryProvider).markAllRead();
              ref.invalidate(notificationsListProvider);
            },
            child: const Text(AppStrings.markAllRead),
          ),
        ],
      ),
      body: notifications.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.notifications_none_outlined,
              title: AppStrings.noNotifications,
            );
          }
          return ListView.separated(
            padding: scrollSafePadding(
              context,
              base: const EdgeInsets.all(AppSpacing.lg),
            ),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final item = items[index];
              return AppCard(
                child: ListTile(
                  tileColor: item.isRead ? null : AppColors.primarySoft,
                  contentPadding: EdgeInsets.zero,
                  title: Text(item.title, style: AppTypography.subtitle),
                  subtitle: Text(item.body, style: AppTypography.bodySmall),
                  onTap: () async {
                    await ref.read(notificationsRepositoryProvider).markRead(item.id);
                    ref.invalidate(notificationsListProvider);
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
