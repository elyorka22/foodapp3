import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';

class HomeBannerGrid extends StatelessWidget {
  const HomeBannerGrid({super.key, required this.banners});

  final List<BannerModel> banners;

  BannerModel? _pick(String placement) {
    for (final b in banners) {
      if (b.placement == placement && resolveImageUrl(b.imageUrl) != null) {
        return b;
      }
    }
    return null;
  }

  List<BannerModel> get _legacyHero {
    return banners.where((b) {
      final p = b.placement ?? 'HERO';
      return (p == 'HERO' || p == 'PROMO') && resolveImageUrl(b.imageUrl) != null;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final legacy = _legacyHero;
    final main = _pick('HOME_MAIN') ?? (legacy.isNotEmpty ? legacy[0] : null);
    final top = _pick('HOME_SIDE_TOP') ?? (legacy.length > 1 ? legacy[1] : null);
    final bottom = _pick('HOME_SIDE_BOTTOM') ?? (legacy.length > 2 ? legacy[2] : null);

    if (main == null && top == null && bottom == null) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 280,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            flex: 1,
            child: _tile(context, main, tall: true),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(child: _tile(context, top)),
                const SizedBox(height: AppSpacing.sm),
                Expanded(child: _tile(context, bottom)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, BannerModel? banner, {bool tall = false}) {
    if (banner == null) {
      return DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.border,
          borderRadius: BorderRadius.circular(24),
        ),
      );
    }
    final url = resolveImageUrl(banner.imageUrl);
    return Material(
      color: AppColors.border,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: banner.linkUrl != null && banner.linkUrl!.isNotEmpty
            ? () => context.push(banner.linkUrl!)
            : null,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (url != null)
              CachedNetworkImage(imageUrl: url, fit: BoxFit.cover)
            else
              const ColoredBox(color: AppColors.primarySoft),
            if (banner.title.isNotEmpty)
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Text(
                  banner.title,
                  style: AppTypography.subtitle.copyWith(color: Colors.white),
                  maxLines: tall ? 3 : 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
