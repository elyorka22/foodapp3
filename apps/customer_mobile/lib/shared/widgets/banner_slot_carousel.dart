import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';

class BannerSlotCarousel extends StatefulWidget {
  const BannerSlotCarousel({
    super.key,
    required this.banners,
    this.tall = false,
  });

  final List<BannerModel> banners;
  final bool tall;

  @override
  State<BannerSlotCarousel> createState() => _BannerSlotCarouselState();
}

class _BannerSlotCarouselState extends State<BannerSlotCarousel> {
  late final PageController _controller;
  Timer? _timer;
  int _count = 0;

  List<BannerModel> get _withImages {
    return widget.banners
        .where((b) => resolveImageUrl(b.imageUrl) != null)
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
  void didUpdateWidget(BannerSlotCarousel oldWidget) {
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

  @override
  Widget build(BuildContext context) {
    final items = _withImages;
    if (items.isEmpty) {
      return DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.border,
          borderRadius: BorderRadius.circular(24),
        ),
      );
    }

    if (items.length == 1) {
      return _BannerTile(banner: items[0], tall: widget.tall);
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        PageView.builder(
          controller: _controller,
          itemCount: items.length,
          itemBuilder: (_, i) => _BannerTile(banner: items[i], tall: widget.tall),
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

class _BannerTile extends StatelessWidget {
  const _BannerTile({required this.banner, this.tall = false});

  final BannerModel banner;
  final bool tall;

  @override
  Widget build(BuildContext context) {
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
