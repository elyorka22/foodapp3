import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../data/audit_model.dart';
import '../data/audit_repository.dart';

final auditListProvider =
    FutureProvider.autoDispose<PaginatedResponse<AuditLogEntry>>((ref) {
  return ref.watch(auditRepositoryProvider).fetchAuditLogs(page: 1, limit: 40);
});

class AuditScreen extends ConsumerWidget {
  const AuditScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(auditListProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Text(AppStrings.auditTitle, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<AuditLogEntry>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(auditListProvider.future),
            isEmpty: (p) => p.data.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (page) {
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: page.data.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final e = page.data[index];
                  final who = e.user?.fullName ??
                      e.user?.email ??
                      e.userId ??
                      '—';
                  return ControlListCard(
                    title: '${e.action} · ${e.entity}',
                    subtitle: [
                      who,
                      if (e.entityId != null) e.entityId!,
                      if (e.createdAt != null) formatDateTime(e.createdAt),
                    ].join(' · '),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
