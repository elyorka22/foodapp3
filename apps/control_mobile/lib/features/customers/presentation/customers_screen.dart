import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/customers_repository.dart';

final customersListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlCustomer>>((ref) {
  return ref
      .watch(customersRepositoryProvider)
      .fetchCustomers(page: 1, limit: 40);
});

class CustomersScreen extends ConsumerWidget {
  const CustomersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(customersListProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const PageHeader(title: AppStrings.navCustomers),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlCustomer>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(customersListProvider.future),
            isEmpty: (p) => p.data.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            dataBuilder: (page) => ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: page.data.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, i) {
                final c = page.data[i];
                final contact = [
                  if (c.phone != null && c.phone!.isNotEmpty) c.phone!,
                  if (c.email != null && c.email!.isNotEmpty) c.email!,
                ].join(' · ');
                return _CustomerRow(
                  customer: c,
                  contact: contact,
                  onToggle: () async {
                    try {
                      await ref
                          .read(customersRepositoryProvider)
                          .updateStatus(c.id, isActive: !c.isActive);
                      ref.invalidate(customersListProvider);
                      if (context.mounted) {
                        showActionSnackBar(context, AppStrings.actionDone);
                      }
                    } catch (e) {
                      if (context.mounted) showActionError(context, e);
                    }
                  },
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _CustomerRow extends StatelessWidget {
  const _CustomerRow({
    required this.customer,
    required this.contact,
    required this.onToggle,
  });

  final ControlCustomer customer;
  final String contact;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        side: const BorderSide(color: AppColors.borderLight),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 8, 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    customer.displayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.subtitle.copyWith(fontSize: 13.5),
                  ),
                ),
                const SizedBox(width: 8),
                StatusChip(
                  status: customer.isActive ? 'DELIVERED' : 'CANCELLED',
                  label: customer.isActive
                      ? AppStrings.active
                      : AppStrings.inactive,
                ),
              ],
            ),
            if (contact.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text(
                contact,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.bodySmall,
              ),
            ],
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onToggle,
                style: TextButton.styleFrom(
                  foregroundColor: customer.isActive
                      ? AppColors.danger
                      : AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: const Size(0, 32),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  customer.isActive
                      ? AppStrings.deactivate
                      : AppStrings.activate,
                  maxLines: 1,
                  softWrap: false,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
