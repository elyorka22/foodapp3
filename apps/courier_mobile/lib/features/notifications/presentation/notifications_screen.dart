import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../data/notifications_repository.dart';

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
      appBar: AppBar(
        title: const Text(AppStrings.notifications),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(notificationsRepositoryProvider).markAllRead();
              ref.invalidate(notificationsListProvider);
            },
            child: const Text('O\'qildi'),
          ),
        ],
      ),
      body: notifications.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text(AppStrings.noNotifications));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                tileColor: item.isRead ? null : const Color(0xFFFFF4EB),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                title: Text(item.title),
                subtitle: Text(item.body),
                onTap: () async {
                  await ref.read(notificationsRepositoryProvider).markRead(item.id);
                  ref.invalidate(notificationsListProvider);
                },
              );
            },
          );
        },
      ),
    );
  }
}
