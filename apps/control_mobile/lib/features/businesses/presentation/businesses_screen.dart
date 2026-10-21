import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../cities/data/cities_repository.dart';
import '../data/businesses_repository.dart';
import '../data/restaurant_model.dart';
import 'business_create_sheet.dart';
import 'business_detail_sheet.dart';

final _businessCityFilterProvider =
    StateProvider.autoDispose<String?>((ref) => null);

final businessesListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlRestaurant>>((ref) {
  final cityId = ref.watch(_businessCityFilterProvider);
  return ref.watch(businessesRepositoryProvider).fetchRestaurants(
        page: 1,
        limit: 40,
        query: {
          if (cityId != null && cityId.isNotEmpty) 'cityId': cityId,
        },
      );
});

final _citiesForFilterProvider =
    FutureProvider.autoDispose<List<ControlCity>>((ref) {
  return ref.watch(citiesRepositoryProvider).fetchCities();
});

class BusinessesScreen extends ConsumerWidget {
  const BusinessesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(businessesListProvider);
    final citiesAsync = ref.watch(_citiesForFilterProvider);
    final selectedCityId = ref.watch(_businessCityFilterProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.businessesTitle,
          trailing: HeaderAction(
            label: AppStrings.create,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addBusiness,
              initialChildSize: 0.92,
              builder: (_) => const BusinessCreateSheet(),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            AppSpacing.sm,
          ),
          child: citiesAsync.when(
            data: (cities) {
              final active = cities.where((c) => c.isActive).toList();
              return DropdownButtonFormField<String?>(
                value: selectedCityId,
                decoration: const InputDecoration(
                  labelText: AppStrings.filterByCity,
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text(AppStrings.allCities),
                  ),
                  for (final c in active)
                    DropdownMenuItem<String?>(
                      value: c.id,
                      child: Text(c.name),
                    ),
                ],
                onChanged: (v) {
                  ref.read(_businessCityFilterProvider.notifier).state = v;
                },
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlRestaurant>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(businessesListProvider.future),
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
                  final r = page.data[index];
                  return ControlListCard(
                    leading: _BizAvatar(logoUrl: r.logoUrl),
                    title: r.name,
                    subtitle: [
                      if (r.businessTypeName != null &&
                          r.businessTypeName!.isNotEmpty)
                        r.businessTypeName!,
                      if (r.cityName != null && r.cityName!.isNotEmpty)
                        r.cityName!,
                      r.approvalStatus,
                      if (r.branchAddress != null) r.branchAddress!,
                      formatMoney(r.revenue),
                    ].join(' · '),
                    trailing: StatusChip(
                      status: r.isActive ? 'DELIVERED' : 'CANCELLED',
                      label:
                          r.isActive ? AppStrings.active : AppStrings.inactive,
                    ),
                    onTap: () => showDetailSheet(
                      context: context,
                      title: AppStrings.details,
                      builder: (_) => BusinessDetailSheet(restaurant: r),
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

class _BizAvatar extends StatelessWidget {
  const _BizAvatar({this.logoUrl});

  final String? logoUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(8),
      ),
      clipBehavior: Clip.antiAlias,
      child: logoUrl != null && logoUrl!.isNotEmpty
          ? Image.network(
              logoUrl!,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const Icon(
                Icons.storefront_outlined,
                size: 20,
                color: AppColors.primary,
              ),
            )
          : const Icon(
              Icons.storefront_outlined,
              size: 20,
              color: AppColors.primary,
            ),
    );
  }
}
