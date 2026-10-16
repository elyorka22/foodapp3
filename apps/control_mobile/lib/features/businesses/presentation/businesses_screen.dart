import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../cities/data/cities_repository.dart';
import '../data/businesses_repository.dart';
import '../data/restaurant_model.dart';
import 'business_detail_sheet.dart';

final _businessCityFilterProvider = StateProvider.autoDispose<String?>((ref) => null);

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
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppStrings.businessesTitle, style: AppTypography.display),
              const SizedBox(height: AppSpacing.sm),
              citiesAsync.when(
                data: (cities) {
                  final active = cities.where((c) => c.isActive).toList();
                  return DropdownButtonFormField<String?>(
                    value: selectedCityId,
                    decoration: const InputDecoration(
                      labelText: AppStrings.filterByCity,
                      isDense: true,
                      border: OutlineInputBorder(),
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
            ],
          ),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlRestaurant>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(businessesListProvider.future),
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
                  final r = page.data[index];
                  return ControlListCard(
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: r.logoUrl != null && r.logoUrl!.isNotEmpty
                          ? Image.network(
                              r.logoUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.storefront_outlined,
                                color: AppColors.primary,
                              ),
                            )
                          : const Icon(
                              Icons.storefront_outlined,
                              color: AppColors.primary,
                            ),
                    ),
                    title: r.name,
                    subtitle: [
                      if (r.cityName != null && r.cityName!.isNotEmpty) r.cityName!,
                      r.approvalStatus,
                      if (r.branchAddress != null) r.branchAddress!,
                      '${r.ordersCount} buyurtma',
                      formatMoney(r.revenue),
                    ].join(' · '),
                    trailing: StatusChip(
                      status: r.isActive ? 'DELIVERED' : 'CANCELLED',
                      label: r.isActive ? AppStrings.active : AppStrings.inactive,
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
