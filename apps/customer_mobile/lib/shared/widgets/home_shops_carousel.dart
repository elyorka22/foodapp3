import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../../core/utils/restaurant_card_meta.dart';
import '../models/business_model.dart';
import 'home_section_header.dart';

const _tileTints = [
  Color(0xFFE8F5E9),
  Color(0xFFE3F2FD),
  Color(0xFFFFF3E0),
  Color(0xFFFCE4EC),
  Color(0xFFE0F7FA),
  Color(0xFFFFF8E1),
  Color(0xFFEFEBE9),
];

Color _tintFor(String name, int index) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = (hash + name.codeUnitAt(i) * (i + 1)) % 997;
  }
  return _tileTints[(hash + index) % _tileTints.length];
}

/// Matches web `home-shops-carousel.tsx`.
class HomeShopsCarousel extends StatelessWidget {
  const HomeShopsCarousel({
    super.key,
    required this.stores,
    this.isLoading = false,
    this.total,
  });

  final List<BusinessModel> stores;
  final bool isLoading;
  final int? total;

  @override
  Widget build(BuildContext context) {
    if (!isLoading && stores.isEmpty) return const SizedBox.shrink();

    final count = total ?? stores.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        HomeSectionHeader(
          title: AppStrings.groceryStores,
          count: count,
          onSeeAll: () => context.push('/stores?type=grocery'),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 148,
          child: isLoading
              ? ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: 4,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (_, __) => const _ShopSkeleton(),
                )
              : ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: stores.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, index) {
                    final store = stores[index];
                    return _ShopCard(store: store, index: index);
                  },
                ),
        ),
      ],
    );
  }
}

class _ShopCard extends StatelessWidget {
  const _ShopCard({required this.store, required this.index});

  final BusinessModel store;
  final int index;

  @override
  Widget build(BuildContext context) {
    final logo = resolveImageUrl(store.logoUrl ?? store.coverUrl);
    final delivery = businessDeliveryLabel(store);
    final typeLabel = store.businessType?.name.trim();

    return GestureDetector(
      onTap: () => context.push('/stores/${store.slug}'),
      child: SizedBox(
        width: 132,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 3 / 2,
              child: Container(
                decoration: BoxDecoration(
                  color: _tintFor(store.name, index),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                ),
                clipBehavior: Clip.antiAlias,
                child: logo != null
                    ? Padding(
                        padding: const EdgeInsets.all(10),
                        child: CachedNetworkImage(
                          imageUrl: logo,
                          fit: BoxFit.contain,
                          errorWidget: (_, __, ___) => _Initial(name: store.name),
                        ),
                      )
                    : _Initial(name: store.name),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              delivery,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 4),
            if (typeLabel != null && typeLabel.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(AppSpacing.pillRadius),
                ),
                child: Text(
                  typeLabel,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              )
            else
              Text(
                store.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Initial extends StatelessWidget {
  const _Initial({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: AppTypography.title.copyWith(
          color: AppColors.textMuted.withValues(alpha: 0.7),
          fontSize: 28,
        ),
      ),
    );
  }
}

class _ShopSkeleton extends StatelessWidget {
  const _ShopSkeleton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 132,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 3 / 2,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.primarySoft,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 12,
            width: 56,
            color: AppColors.primarySoft,
          ),
        ],
      ),
    );
  }
}
