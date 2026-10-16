import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/mutation_button.dart';
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
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Text(AppStrings.navCustomers, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlCustomer>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(customersListProvider.future),
            isEmpty: (p) => p.data.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (page) => ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: page.data.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final c = page.data[i];
                return ControlListCard(
                  title: c.displayName,
                  subtitle: [
                    if (c.phone != null) c.phone!,
                    if (c.email != null) c.email!,
                  ].join(' · '),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      StatusChip(
                        status: c.isActive ? 'DELIVERED' : 'CANCELLED',
                        label:
                            c.isActive ? AppStrings.active : AppStrings.inactive,
                      ),
                      const SizedBox(width: 8),
                      MutationButton(
                        label: c.isActive
                            ? AppStrings.deactivate
                            : AppStrings.activate,
                        filled: false,
                        onPressed: () async {
                          try {
                            await ref
                                .read(customersRepositoryProvider)
                                .updateStatus(c.id, isActive: !c.isActive);
                            ref.invalidate(customersListProvider);
                            if (context.mounted) {
                              showActionSnackBar(
                                  context, AppStrings.actionDone);
                            }
                          } catch (e) {
                            if (context.mounted) showActionError(context, e);
                          }
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
