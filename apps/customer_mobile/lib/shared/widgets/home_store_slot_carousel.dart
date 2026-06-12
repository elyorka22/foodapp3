import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/utils/business_kind.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_framing.dart';
import '../../core/utils/image_url.dart';
import '../models/business_model.dart';

class HomeStoreSlotCarousel extends StatefulWidget {
  const HomeStoreSlotCarousel({
    super.key,
    required this.stores,
    this.fallbackRoute = AppRoutes.stores,
  });

  final List<BusinessModel> stores;
  final String fallbackRoute;

  @override
  State<HomeStoreSlotCarousel> createState() => _HomeStoreSlotCarouselState();
}

class _HomeStoreSlotCarouselState extends State<HomeStoreSlotCarousel> {
  late final PageController _controller;
  Timer? _timer;
  int _count = 0;

  List<BusinessModel> get _storeOnly {
    return filterStoreBusinesses(
      widget.stores,
      kindOf: (s) => s.kind,
      typeSlugOf: (s) => s.businessType?.slug,
    );
  }

  List<BusinessModel> get _withImages {
    return _storeOnly
        .where((s) => resolveImageUrl(s.coverUrl ?? s.logoUrl) != null)
        .toList();
  }

  @override
  void initState() {
    super.initState();
    _count = _withImages.length;
    _controller = PageController();
    _startAutoPlay();
  }

  @override
  void didUpdateWidget(HomeStoreSlotCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    final next = _withImages.length;
    if (next != _count) {
      _count = next;
      if (_controller.hasClients) {
        _controller.jumpToPage(0);
      }
      _restartAutoPlay();
    }
  }

  void _startAutoPlay() {
    _timer?.cancel();
    if (_withImages.length <= 1) return;
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!_controller.hasClients) return;
      final next = (_controller.page?.round() ?? 0) + 1;
      _controller.animateToPage(
        next % _withImages.length,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  void _restartAutoPlay() {
    _timer?.cancel();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Widget _fallback() {
    return Material(
      color: AppColors.border,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(widget.fallbackRoute),
        child: Center(
          child: Text(
            AppStrings.navStores,
            style: AppTypography.subtitle.copyWith(color: AppColors.success),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = _withImages;
    if (items.isEmpty) {
      return _fallback();
    }

    if (items.length == 1) {
      return _StoreTile(store: items[0]);
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        PageView.builder(
          controller: _controller,
          itemCount: items.length,
          itemBuilder: (_, i) => _StoreTile(store: items[i]),
        ),
        Positioned(
          left: 0,
          right: 0,
          bottom: 8,
          child: Center(
            child: SmoothPageIndicator(
              controller: _controller,
              count: items.length,
              effect: const WormEffect(
                dotHeight: 6,
                dotWidth: 6,
                activeDotColor: Colors.white,
                dotColor: Color(0x88FFFFFF),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

String _storeRoute(BusinessModel store) {
  final slug = store.slug.trim();
  if (slug.isNotEmpty) return '${AppRoutes.stores}/$slug';
  return '${AppRoutes.stores}/${store.id}';
}

class _StoreTile extends StatelessWidget {
  const _StoreTile({required this.store});

  final BusinessModel store;

  @override
  Widget build(BuildContext context) {
    final url = resolveImageUrl(store.coverUrl ?? store.logoUrl);
    final route = _storeRoute(store);

    return Material(
      color: AppColors.border,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(route),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (url != null)
              applyImageFraming(
                imageScale: store.coverScale,
                imagePositionX: store.coverPositionX,
                imagePositionY: store.coverPositionY,
                child: CachedNetworkImage(
                  imageUrl: url,
                  fit: BoxFit.cover,
                  alignment: Alignment(
                    ((store.coverPositionX ?? 50) / 50) - 1,
                    ((store.coverPositionY ?? 50) / 50) - 1,
                  ),
                ),
              )
            else
              const ColoredBox(color: AppColors.primarySoft),
          ],
        ),
      ),
    );
  }
}
