import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/home_headline.dart';
import '../../../shared/widgets/home_promo_banners.dart';
import '../../../shared/widgets/home_restaurants_carousel.dart';
import '../../../shared/widgets/home_service_grid.dart';
import '../../../shared/widgets/home_shops_carousel.dart';
import '../../stores/providers/stores_provider.dart';
import '../providers/restaurants_provider.dart';

/// Home tab — same island as the web home.
class RestaurantsScreen extends ConsumerWidget {
  const RestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final banners = ref.watch(bannersProvider);
    final featuredStores = ref.watch(homeFeaturedStoresProvider);
    final restaurants = ref.watch(restaurantsListProvider(null));

    return Scaffold(
      backgroundColor: const Color(0xFFFF2E95),
      body: Stack(
        children: [
          const _PinkLimeBackdrop(),
          _CoveringIsland(
        onRefresh: () async {
          ref.invalidate(publicSettingsProvider);
          ref.invalidate(bannersProvider);
          ref.invalidate(homeFeaturedStoresProvider);
          ref.invalidate(restaurantsListProvider);
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const HomeServiceGrid(),
            const SizedBox(height: 20),
            HomePromoBanners(
              banners: banners.valueOrNull ?? const [],
              isLoading: banners.isLoading,
            ),
            const SizedBox(height: 24),
            HomeRestaurantsCarousel(
              restaurants: restaurants.valueOrNull ?? const [],
              isLoading: restaurants.isLoading,
              total: restaurants.valueOrNull?.length,
            ),
            const SizedBox(height: 24),
            HomeShopsCarousel(
              stores: featuredStores.valueOrNull ?? const [],
              isLoading: featuredStores.isLoading,
              total: featuredStores.valueOrNull?.length,
            ),
            if (restaurants.hasError) ...[
              const SizedBox(height: 16),
              Text(
                ApiException.formatError(restaurants.error!),
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
            if (!restaurants.isLoading &&
                !restaurants.hasError &&
                (restaurants.valueOrNull?.isEmpty ?? false)) ...[
              const SizedBox(height: 16),
              Text(
                AppStrings.restaurantsComingSoon,
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
          ),
        ],
      ),
    );
  }
}

/// Lime and hot-pink field behind the white home island.
class _PinkLimeBackdrop extends StatelessWidget {
  const _PinkLimeBackdrop();

  @override
  Widget build(BuildContext context) {
    return const IgnorePointer(
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFF4DB5),
              Color(0xFFFF2A92),
              Color(0xFFE7FF55),
            ],
            stops: [0, 0.48, 1],
          ),
        ),
        child: SizedBox.expand(
          child: Stack(
            children: [
              Positioned(
                top: -50,
                left: -40,
                child: _Blob(size: 220, color: Color(0xFFD8FF3C)),
              ),
              Positioned(
                top: 10,
                right: -70,
                child: _Blob(size: 190, color: Color(0xFFFF5AD4)),
              ),
              Positioned(
                top: 120,
                right: 20,
                child: _Blob(size: 140, color: Color(0xFFC6FF45)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  const _Blob({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.85),
      ),
    );
  }
}

/// City and bell stay put. The white sheet scrolls up and covers them.
class _CoveringIsland extends StatefulWidget {
  const _CoveringIsland({
    required this.onRefresh,
    required this.child,
  });

  final Future<void> Function() onRefresh;
  final Widget child;

  @override
  State<_CoveringIsland> createState() => _CoveringIslandState();
}

class _CoveringIslandState extends State<_CoveringIsland> {
  final _scroll = ScrollController();

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final safeTop = MediaQuery.paddingOf(context).top;
    // 10px top pad + 44px city row + extra gray field before the sheet.
    const headerBody = 94.0;
    final headerHeight = safeTop + headerBody;

    return LayoutBuilder(
      builder: (context, constraints) {
        return AnimatedBuilder(
          animation: _scroll,
          builder: (context, _) {
            final offset = _scroll.hasClients ? _scroll.offset : 0.0;
            final visibleHeader =
                (headerHeight - offset).clamp(0.0, headerHeight);
            final radius = visibleHeader <= 1 ? 0.0 : 32.0;

            return AnnotatedRegion<SystemUiOverlayStyle>(
              value: visibleHeader > 24
                  ? SystemUiOverlayStyle.light
                  : SystemUiOverlayStyle.dark,
              child: Stack(
              children: [
                RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: widget.onRefresh,
                  child: ListView(
                    controller: _scroll,
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: EdgeInsets.only(top: headerHeight),
                    children: [
                      ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(radius),
                            ),
                          ),
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                          child: widget.child,
                        ),
                      ),
                    ],
                  ),
                ),
                if (visibleHeader > 0)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: visibleHeader,
                    child: ClipRect(
                      child: OverflowBox(
                        alignment: Alignment.topCenter,
                        minHeight: headerHeight,
                        maxHeight: headerHeight,
                        child: Padding(
                          padding:
                              EdgeInsets.fromLTRB(16, safeTop + 10, 16, 12),
                          child: const HomeHeadline(),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            );
          },
        );
      },
    );
  }
}
