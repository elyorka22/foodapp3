import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/public_settings_provider.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_framing.dart';
import '../../core/utils/image_url.dart';
import '../../features/restaurants/providers/dish_categories_provider.dart';
import '../models/dish_category_model.dart';

const _autoScrollInterval = Duration(seconds: 5);
const _manualPauseDuration = Duration(seconds: 10);

class HomeSecondaryBanners extends ConsumerWidget {
  const HomeSecondaryBanners({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(publicSettingsProvider);
    final categories = ref.watch(dishCategoriesProvider);

    return settings.when(
      data: (publicSettings) => categories.when(
        data: (items) {
          final active = items;
          if (active.isEmpty &&
              publicSettings.homeRestaurantsBannerImageUrl.trim().isEmpty) {
            return const SizedBox.shrink();
          }
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _AllRestaurantsBanner(settings: publicSettings),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _DishCategoriesBanner(categories: active),
              ),
            ],
          );
        },
        loading: () => const _HomeSecondaryBannersSkeleton(),
        error: (_, __) => _AllRestaurantsBanner(
          settings: publicSettings,
        ),
      ),
      loading: () => const _HomeSecondaryBannersSkeleton(),
      error: (_, __) => categories.when(
        data: (items) => _DishCategoriesBanner(categories: items),
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
      ),
    );
  }
}

class _HomeSecondaryBannersSkeleton extends StatelessWidget {
  const _HomeSecondaryBannersSkeleton();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _bannerSkeleton()),
        const SizedBox(width: AppSpacing.sm),
        Expanded(child: _bannerSkeleton()),
      ],
    );
  }

  Widget _bannerSkeleton() {
    return Column(
      children: [
        AspectRatio(
          aspectRatio: 4 / 3,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(24),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: 12,
          width: 72,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppColors.border,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
      ],
    );
  }
}

class _AllRestaurantsBanner extends StatelessWidget {
  const _AllRestaurantsBanner({required this.settings});

  final PublicSettings settings;

  @override
  Widget build(BuildContext context) {
    final title = settings.homeRestaurantsBannerTitle.trim().isNotEmpty
        ? settings.homeRestaurantsBannerTitle.trim()
        : AppStrings.allRestaurants;
    final imageUrl = resolveImageUrl(settings.homeRestaurantsBannerImageUrl);

    return GestureDetector(
      onTap: () => context.push(AppRoutes.allRestaurants),
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) => _fallback(title),
                    )
                  : _fallback(title),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _fallback(String title) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFE6F7F1),
      alignment: Alignment.center,
      padding: const EdgeInsets.all(8),
      child: Text(
        title,
        textAlign: TextAlign.center,
        style: AppTypography.bodySmall.copyWith(
          fontWeight: FontWeight.w600,
          color: const Color(0xFF065F46),
        ),
      ),
    );
  }
}

class _DishCategoriesBanner extends StatefulWidget {
  const _DishCategoriesBanner({required this.categories});

  final List<DishCategoryModel> categories;

  @override
  State<_DishCategoriesBanner> createState() => _DishCategoriesBannerState();
}

class _DishCategoriesBannerState extends State<_DishCategoriesBanner> {
  late final PageController _controller;
  Timer? _timer;
  int _activeIndex = 0;
  DateTime _pauseUntil = DateTime.fromMillisecondsSinceEpoch(0);
  bool _programmaticScroll = false;

  List<DishCategoryModel> get _slides => widget.categories;

  @override
  void initState() {
    super.initState();
    _controller = PageController();
    _startAutoPlay();
  }

  @override
  void didUpdateWidget(covariant _DishCategoriesBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.categories.length != widget.categories.length ||
        (widget.categories.isNotEmpty &&
            oldWidget.categories.isNotEmpty &&
            oldWidget.categories.first.id != widget.categories.first.id)) {
      _activeIndex = 0;
      if (_controller.hasClients) {
        _controller.jumpToPage(0);
      }
      _startAutoPlay();
    }
  }

  void _pauseAuto() {
    _pauseUntil = DateTime.now().add(_manualPauseDuration);
  }

  void _startAutoPlay() {
    _timer?.cancel();
    if (_slides.length <= 1) return;
    _timer = Timer.periodic(_autoScrollInterval, (_) {
      if (DateTime.now().isBefore(_pauseUntil)) return;
      if (!_controller.hasClients) return;
      final next = (_controller.page?.round() ?? _activeIndex) + 1;
      _programmaticScroll = true;
      _controller
          .animateToPage(
            next % _slides.length,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
          )
          .whenComplete(() {
        Future<void>.delayed(const Duration(milliseconds: 500), () {
          if (mounted) _programmaticScroll = false;
        });
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_slides.isEmpty) {
      return Column(
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Container(
                color: AppColors.primarySoft,
                alignment: Alignment.center,
                child: Text(
                  AppStrings.dishCategories,
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            AppStrings.dishCategories,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      );
    }

    if (_slides.length == 1) {
      return _CategoryTile(category: _slides[0]);
    }

    return Column(
      children: [
        AspectRatio(
          aspectRatio: 4 / 3,
          child: Listener(
            onPointerDown: (_) => _pauseAuto(),
            child: PageView.builder(
              controller: _controller,
              itemCount: _slides.length,
              onPageChanged: (index) {
                setState(() => _activeIndex = index);
                if (!_programmaticScroll) {
                  _pauseAuto();
                }
              },
              itemBuilder: (_, index) => _CategorySlide(category: _slides[index]),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _slides[_activeIndex].name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _CategorySlide extends StatelessWidget {
  const _CategorySlide({required this.category});

  final DishCategoryModel category;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(AppRoutes.categoryProducts(category.slug)),
      child: _CategoryImage(category: category),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({required this.category});

  final DishCategoryModel category;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(AppRoutes.categoryProducts(category.slug)),
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: _CategoryImage(category: category),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            category.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _CategoryImage extends StatelessWidget {
  const _CategoryImage({required this.category});

  final DishCategoryModel category;

  @override
  Widget build(BuildContext context) {
    final imageUrl = category.resolvedImageUrl;
    if (imageUrl == null) {
      return _categoryFallback(category.name);
    }

    return applyImageFraming(
      imageScale: category.imageScale,
      imagePositionX: category.imagePositionX,
      imagePositionY: category.imagePositionY,
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        alignment: Alignment(
          ((category.imagePositionX ?? 50) / 50) - 1,
          ((category.imagePositionY ?? 50) / 50) - 1,
        ),
        errorWidget: (_, __, ___) => _categoryFallback(category.name),
      ),
    );
  }

  Widget _categoryFallback(String name) {
    return Container(
      width: double.infinity,
      color: AppColors.primarySoft,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(8),
      child: Text(
        name,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}
