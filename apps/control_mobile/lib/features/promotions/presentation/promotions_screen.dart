import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/banner_model.dart';
import '../data/promo_model.dart';
import '../data/promotions_repository.dart';

class _PromotionsBundle {
  const _PromotionsBundle({
    required this.banners,
    required this.promos,
  });

  final List<ControlBanner> banners;
  final List<ControlPromoCode> promos;
}

final promotionsProvider =
    FutureProvider.autoDispose<_PromotionsBundle>((ref) async {
  final repo = ref.watch(promotionsRepositoryProvider);
  final banners = await repo.fetchBannersAdmin();
  final promos = await repo.fetchPromoCodes();
  return _PromotionsBundle(banners: banners, promos: promos);
});

class PromotionsScreen extends ConsumerWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(promotionsProvider);

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
          child: Text(AppStrings.promotionsTitle, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<_PromotionsBundle>(
            asyncValue: async,
            onRefresh: () => ref.refresh(promotionsProvider.future),
            isEmpty: (b) => b.banners.isEmpty && b.promos.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (bundle) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(AppStrings.bannersSection, style: AppTypography.subtitle),
                  const SizedBox(height: 8),
                  if (bundle.banners.isEmpty)
                    Text(AppStrings.emptyList, style: AppTypography.bodySmall)
                  else
                    ...bundle.banners.map((b) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: ControlListCard(
                          title: b.title.isNotEmpty
                              ? b.title
                              : (b.placement.isNotEmpty ? b.placement : b.id),
                          subtitle: [
                            if (b.placement.isNotEmpty) b.placement,
                            if (b.linkUrl != null) b.linkUrl!,
                          ].join(' · '),
                          trailing: StatusChip(
                            status: b.isActive ? 'DELIVERED' : 'CANCELLED',
                            label: b.isActive ? 'Faol' : 'Nofaol',
                          ),
                        ),
                      );
                    }),
                  const SizedBox(height: 20),
                  Text(AppStrings.promosSection, style: AppTypography.subtitle),
                  const SizedBox(height: 8),
                  if (bundle.promos.isEmpty)
                    Text(AppStrings.emptyList, style: AppTypography.bodySmall)
                  else
                    ...bundle.promos.map((p) {
                      final valueLabel = p.type.toUpperCase().contains('PERCENT')
                          ? '${p.value}%'
                          : formatMoney(p.value);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: ControlListCard(
                          title: p.code,
                          subtitle: [
                            valueLabel,
                            'ishlatilgan: ${p.usageCount}',
                            if (p.expiresAt != null)
                              'tugash: ${formatDateTime(p.expiresAt)}',
                          ].join(' · '),
                          trailing: StatusChip(
                            status: p.isActive ? 'DELIVERED' : 'CANCELLED',
                            label: p.isActive ? 'Faol' : 'Nofaol',
                          ),
                        ),
                      );
                    }),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}
