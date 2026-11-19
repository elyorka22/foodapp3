import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';
import 'section_island.dart';

/// Matches web `home-promo-banners.tsx` — full-width, no title, shorter height.
class HomePromoBanners extends StatelessWidget {
  const HomePromoBanners({
    super.key,
    required this.banners,
    this.isLoading = false,
  });

  final List<BannerModel> banners;
  final bool isLoading;

  static const double _height = 120;

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
    final screenW = MediaQuery.sizeOf(context).width;

    if (isLoading) {
      return Padding(
        padding: const EdgeInsets.only(top: SectionIsland.gap),
        child: SizedBox(
          height: _height,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.primarySoft,
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
      );
    }

    final slides = _slides;
    if (slides.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: SectionIsland.gap),
      child: SizedBox(
        height: _height,
        child: PageView.builder(
          itemCount: slides.length,
          controller: PageController(viewportFraction: 1),
          itemBuilder: (context, index) {
            final banner = slides[index];
            final src = resolveImageUrl(banner.imageUrl)!;
            final href = (banner.linkUrl ?? '').trim();
            final title = banner.title.trim();

            return Padding(
              padding: EdgeInsets.symmetric(
                horizontal: slides.length > 1 ? 2 : 0,
              ),
              child: GestureDetector(
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
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                    width: screenW,
                    height: _height,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        ColoredBox(color: AppColors.primarySoft),
                        CachedNetworkImage(
                          imageUrl: src,
                          fit: BoxFit.cover,
                          width: screenW,
                          height: _height,
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
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
