import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(AppStrings.notificationsTitle, style: AppTypography.title)),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  AppStrings.notificationsLoginRequired,
                  style: AppTypography.body,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                FoodAppButton(
                  label: AppStrings.login,
                  onPressed: () => context.push('/profile/login'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final listAsync = ref.watch(notificationsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.notificationsTitle, style: AppTypography.title),
        actions: [
          TextButton(
            onPressed: () async {
              await ref.read(notificationsRepositoryProvider).markAllRead();
              ref.invalidate(notificationsListProvider);
              ref.invalidate(notificationsUnreadProvider);
            },
            child: const Text(AppStrings.notificationsMarkAll),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(notificationsListProvider);
          ref.invalidate(notificationsUnreadProvider);
          await ref.read(notificationsListProvider.future);
        },
        child: listAsync.when(
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const SizedBox(height: 120),
                  Center(
                    child: Text(
                      AppStrings.notificationsEmpty,
                      style: AppTypography.body,
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: scrollSafePadding(
                context,
                base: const EdgeInsets.all(AppSpacing.lg),
              ),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final n = items[index];
                return Material(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () async {
                      if (!n.isRead) {
                        await ref.read(notificationsRepositoryProvider).markRead(n.id);
                        ref.invalidate(notificationsListProvider);
                        ref.invalidate(notificationsUnreadProvider);
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(top: 6),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: n.isRead ? Colors.transparent : const Color(0xFFE85D04),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(n.title, style: AppTypography.title.copyWith(fontSize: 16)),
                                const SizedBox(height: 4),
                                Text(n.body, style: AppTypography.bodySmall),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(ApiException.formatError(e), style: AppTypography.bodySmall, textAlign: TextAlign.center),
                  const SizedBox(height: AppSpacing.md),
                  FoodAppButton(
                    label: AppStrings.retry,
                    onPressed: () => ref.invalidate(notificationsListProvider),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
