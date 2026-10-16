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
import '../../../shared/widgets/status_chip.dart';
import '../data/catalog_repository.dart';
import '../data/product_model.dart';

final catalogListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlProduct>>((ref) {
  return ref.watch(catalogRepositoryProvider).fetchProducts(page: 1, limit: 40);
});

class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(catalogListProvider);

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
          child: Text(AppStrings.catalogTitle, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlProduct>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(catalogListProvider.future),
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
                  final p = page.data[index];
                  return ControlListCard(
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: p.imageUrl != null && p.imageUrl!.isNotEmpty
                          ? Image.network(
                              p.imageUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.fastfood_outlined,
                                color: AppColors.textMuted,
                              ),
                            )
                          : const Icon(
                              Icons.fastfood_outlined,
                              color: AppColors.textMuted,
                            ),
                    ),
                    title: p.name,
                    subtitle: [
                      if (p.businessName != null) p.businessName!,
                      if (p.categoryName != null) p.categoryName!,
                      formatMoney(p.price),
                    ].join(' · '),
                    trailing: StatusChip(
                      status: p.isAvailable ? 'DELIVERED' : 'CANCELLED',
                      label: p.isAvailable ? 'Mavjud' : 'Yopiq',
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
