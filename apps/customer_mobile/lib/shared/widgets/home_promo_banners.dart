import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';
import 'home_section_header.dart';

/// Matches web `home-promo-banners.tsx`.
class HomePromoBanners extends StatelessWidget {
  const HomePromoBanners({
    super.key,
    required this.banners,
    this.isLoading = false,
  });

  final List<BannerModel> banners;
  final bool isLoading;

  List<BannerModel> get _slides {
    final list = banners
        .where((b) => resolveImageUrl(b.imageUrl) != null)
        .where((b) {
          final p = b.placement ?? 'PROMO';
          return p == 'PROMO' || p == 'HERO';
        })
        .toList()
      ..sort((a, b) => (a.sortOrder ?? 0).compareTo(b.sortOrder ?? 0));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeSectionHeader(
            title: AppStrings.specialOffers,
            onSeeAll: () => context.push(AppRoutes.promotions),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 150,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _skeleton(context),
                const SizedBox(width: 12),
                _skeleton(context),
              ],
            ),
          ),
        ],
      );
    }

    final slides = _slides;
    if (slides.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        HomeSectionHeader(
          title: AppStrings.specialOffers,
          linkLabel: AppStrings.seeAll,
          onSeeAll: () => context.push(AppRoutes.promotions),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: slides.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final banner = slides[index];
              final src = resolveImageUrl(banner.imageUrl)!;
              final href = (banner.linkUrl ?? '').trim();
              final title = banner.title.trim();
              final width = MediaQuery.sizeOf(context).width * 0.85;

              return GestureDetector(
                onTap: () {
                  if (href.isEmpty) {
                    context.push(AppRoutes.promotions);
                    return;
                  }
                  if (href.startsWith('/')) {
                    context.push(href);
                  } else {
                    context.push(AppRoutes.promotions);
                  }
                },
                child: Container(
                  width: width,
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(AppSpacing.bannerRadius),
                    boxShadow: AppShadows.promo,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: src,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const ColoredBox(
                          color: AppColors.primarySoft,
                        ),
                      ),
                      if (title.isNotEmpty) ...[
                        const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Color(0x8C000000),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          left: 12,
                          right: 12,
                          bottom: 12,
                          child: Text(
                            title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.subtitle.copyWith(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _skeleton(BuildContext context) {
    return Container(
      width: MediaQuery.sizeOf(context).width * 0.85,
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(AppSpacing.bannerRadius),
      ),
    );
  }
}
