import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/employees_repository.dart';
import '../data/staff_user_model.dart';
import 'employee_create_sheet.dart';
import 'employee_detail_sheet.dart';

final employeesListProvider =
    FutureProvider.autoDispose<PaginatedResponse<StaffUser>>((ref) {
  return ref.watch(employeesRepositoryProvider).fetchUsers();
});

class EmployeesScreen extends ConsumerWidget {
  const EmployeesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(employeesListProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.employeesTitle,
          trailing: HeaderAction(
            label: AppStrings.create,
            icon: Icons.person_add_alt_1,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addEmployee,
              initialChildSize: 0.85,
              builder: (_) => const EmployeeCreateSheet(),
            ),
          ),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<StaffUser>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(employeesListProvider.future),
            isEmpty: (p) => p.data.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            dataBuilder: (page) {
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: page.data.length,
                separatorBuilder: (_, __) => const SizedBox(height: 6),
                itemBuilder: (context, index) {
                  final u = page.data[index];
                  final name = (u.fullName?.isNotEmpty == true)
                      ? u.fullName!
                      : (u.email ?? u.phone ?? u.id);
                  return ControlListCard(
                    leading: CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.primarySoft,
                      child: Text(
                        name.isNotEmpty ? name[0].toUpperCase() : '?',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    title: name,
                    subtitle: [
                      u.role,
                      if (u.email != null) u.email!,
                      if (u.phone != null) u.phone!,
                      if (u.businessName != null) u.businessName!,
                    ].join(' · '),
                    trailing: StatusChip(
                      status: u.isActive ? 'DELIVERED' : 'CANCELLED',
                      label:
                          u.isActive ? AppStrings.active : AppStrings.inactive,
                    ),
                    onTap: () => showDetailSheet(
                      context: context,
                      title: AppStrings.details,
                      builder: (_) => EmployeeDetailSheet(user: u),
                    ),
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
