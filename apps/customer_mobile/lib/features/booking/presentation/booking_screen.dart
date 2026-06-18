import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_framing.dart';
import '../../../core/utils/image_url.dart';
import '../models/booking_models.dart';
import '../providers/booking_provider.dart';

const _bookingBg = AppColors.pageBackground;

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key});

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  int _slideIndex = 0;
  Timer? _slideTimer;

  @override
  void dispose() {
    _slideTimer?.cancel();
    super.dispose();
  }

  void _startSlideTimer(int count) {
    _slideTimer?.cancel();
    if (count <= 1) return;
    _slideTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted) return;
      setState(() => _slideIndex = (_slideIndex + 1) % count);
    });
  }

  String _venueTypeLabel(String type) {
    if (type == 'TABLE') return AppStrings.bookingTypeTable;
    if (type == 'HALL') return AppStrings.bookingTypeHall;
    return AppStrings.bookingTypeBoth;
  }

  @override
  Widget build(BuildContext context) {
    final slidesAsync = ref.watch(bookingSlidesProvider);
    final venuesAsync = ref.watch(bookingVenuesProvider);

    return Scaffold(
      backgroundColor: _bookingBg,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.surface,
          onRefresh: () async {
                ref.invalidate(bookingSlidesProvider);
                ref.invalidate(bookingVenuesProvider);
                await Future.wait([
                  ref.read(bookingSlidesProvider.future),
                  ref.read(bookingVenuesProvider.future),
                ]);
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        AppSpacing.sm,
                        AppSpacing.lg,
                        AppSpacing.xl,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _BackButton(onTap: () => context.pop()),
                          const SizedBox(height: AppSpacing.md),
                          _HeaderBadge(),
                          const SizedBox(height: AppSpacing.sm),
                          const Text(
                            AppStrings.bookingTitle,
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            AppStrings.bookingSubtitle,
                            style: AppTypography.bodySmall.copyWith(height: 1.5),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          slidesAsync.when(
                            data: (slides) {
                              final withImages = slides
                                  .where((s) => resolveImageUrl(s.imageUrl) != null)
                                  .toList();
                              if (withImages.isEmpty) {
                                return const SizedBox.shrink();
                              }
                              if (_slideIndex >= withImages.length) {
                                _slideIndex = 0;
                              }
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                _startSlideTimer(withImages.length);
                              });
                              final slide = withImages[_slideIndex];
                              return _HeroSlide(
                                slide: slide,
                                count: withImages.length,
                                index: _slideIndex,
                                onDotTap: (i) => setState(() => _slideIndex = i),
                                onVenueTap: slide.venueSlug != null
                                    ? () => context.push(
                                          '${AppRoutes.booking}/${slide.venueSlug}',
                                        )
                                    : null,
                              );
                            },
                            loading: () => const _HeroPlaceholder(),
                            error: (_, __) => const SizedBox.shrink(),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          const _FeatureGrid(),
                          const SizedBox(height: AppSpacing.lg),
                          const Text(
                            AppStrings.bookingVenuesTitle,
                            style: AppTypography.title,
                          ),
                          const SizedBox(height: AppSpacing.md),
                        ],
                      ),
                    ),
                  ),
                  venuesAsync.when(
                    data: (venues) {
                      if (venues.isEmpty) {
                        return SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.lg,
                            ),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(AppSpacing.xl),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                color: AppColors.surface,
                                border: Border.all(
                                  color: AppColors.border,
                                  style: BorderStyle.solid,
                                ),
                              ),
                              child: Text(
                                AppStrings.bookingEmpty,
                                textAlign: TextAlign.center,
                                style: AppTypography.bodySmall,
                              ),
                            ),
                          ),
                        );
                      }
                      return SliverPadding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.lg,
                          0,
                          AppSpacing.lg,
                          AppSpacing.xl,
                        ),
                        sliver: SliverList.separated(
                          itemCount: venues.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: AppSpacing.md),
                          itemBuilder: (_, i) => _VenueCard(
                            venue: venues[i],
                            typeLabel: _venueTypeLabel(venues[i].venueType),
                            onTap: () => context.push(
                              '${AppRoutes.booking}/${venues[i].slug}',
                            ),
                          ),
                        ),
                      );
                    },
                    loading: () => const SliverToBoxAdapter(
                      child: Center(
                        child: Padding(
                          padding: EdgeInsets.all(AppSpacing.xl),
                          child: CircularProgressIndicator(color: AppColors.primary),
                        ),
                      ),
                    ),
                    error: (_, __) => SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          children: [
                            Text(
                              AppStrings.bookingLoadError,
                              style: AppTypography.bodySmall,
                            ),
                            TextButton(
                              onPressed: () => ref.invalidate(bookingVenuesProvider),
                              child: const Text(AppStrings.retry),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }
}

class _BackButton extends StatelessWidget {
  const _BackButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      elevation: 1,
      shadowColor: Colors.black12,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.arrow_back, size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Text(
                AppStrings.back,
                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.calendar_month, size: 14, color: AppColors.primary),
          SizedBox(width: 6),
          Text(
            AppStrings.bookingBadge,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroPlaceholder extends StatelessWidget {
  const _HeroPlaceholder();

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 10,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: AppColors.surface,
        ),
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      ),
    );
  }
}

class _HeroSlide extends StatelessWidget {
  const _HeroSlide({
    required this.slide,
    required this.count,
    required this.index,
    required this.onDotTap,
    this.onVenueTap,
  });

  final BookingSlideModel slide;
  final int count;
  final int index;
  final ValueChanged<int> onDotTap;
  final VoidCallback? onVenueTap;

  @override
  Widget build(BuildContext context) {
    final url = resolveImageUrl(slide.imageUrl)!;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: const [
            BoxShadow(
              color: Color(0x14000000),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: AspectRatio(
          aspectRatio: 16 / 10,
          child: Stack(
            fit: StackFit.expand,
            children: [
              applyImageFraming(
                imageScale: slide.imageScale,
                imagePositionX: slide.imagePositionX,
                imagePositionY: slide.imagePositionY,
                child: CachedNetworkImage(
                  imageUrl: url,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                ),
              ),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.25),
                      Colors.black.withValues(alpha: 0.8),
                    ],
                  ),
                ),
              ),
              Positioned(
                left: 20,
                right: 20,
                bottom: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (slide.title.isNotEmpty)
                      Text(
                        slide.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    if (slide.subtitle != null && slide.subtitle!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        slide.subtitle!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFFFEF3C7),
                        ),
                      ),
                    ],
                    if (onVenueTap != null) ...[
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: onVenueTap,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                        ),
                        child: const Text(AppStrings.bookingViewVenue),
                      ),
                    ],
                  ],
                ),
              ),
              if (count > 1)
                Positioned(
                  right: 12,
                  bottom: 12,
                  child: Row(
                    children: List.generate(count, (i) {
                      final active = i == index;
                      return GestureDetector(
                        onTap: () => onDotTap(i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.only(left: 6),
                          width: active ? 20 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(3),
                            color: active
                                ? AppColors.primary
                                : Colors.white.withValues(alpha: 0.7),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureGrid extends StatelessWidget {
  const _FeatureGrid();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Expanded(
          child: _FeatureTile(
            icon: Icons.restaurant,
            title: AppStrings.bookingFeatureTables,
            hint: AppStrings.bookingFeatureTablesHint,
          ),
        ),
        SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _FeatureTile(
            icon: Icons.celebration,
            title: AppStrings.bookingFeatureHalls,
            hint: AppStrings.bookingFeatureHallsHint,
          ),
        ),
      ],
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.title,
    required this.hint,
  });

  final IconData icon;
  final String title;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(height: 8),
          Text(title, style: AppTypography.subtitle.copyWith(fontSize: 14)),
          const SizedBox(height: 4),
          Text(hint, style: AppTypography.caption),
        ],
      ),
    );
  }
}

class _VenueCard extends StatelessWidget {
  const _VenueCard({
    required this.venue,
    required this.typeLabel,
    required this.onTap,
  });

  final BookingVenueModel venue;
  final String typeLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cover = resolveImageUrl(venue.coverUrl ?? venue.logoUrl);

    return Material(
      color: AppColors.surface,
      elevation: 1,
      shadowColor: Colors.black12,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: AspectRatio(
                aspectRatio: 4 / 3,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (cover != null)
                      applyImageFraming(
                        imageScale: venue.coverScale,
                        imagePositionX: venue.coverPositionX,
                        imagePositionY: venue.coverPositionY,
                        child: CachedNetworkImage(
                          imageUrl: cover,
                          fit: BoxFit.cover,
                        ),
                      )
                    else
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primarySoft,
                              Color(0xFFFFE4CC),
                            ],
                          ),
                        ),
                        child: Center(
                          child: Icon(
                            Icons.auto_awesome,
                            color: AppColors.primary,
                            size: 40,
                          ),
                        ),
                      ),
                    Positioned(
                      left: 12,
                      top: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          typeLabel.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    venue.name,
                    style: AppTypography.subtitle.copyWith(fontSize: 18),
                  ),
                  if (venue.description != null &&
                      venue.description!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      venue.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodySmall,
                    ),
                  ],
                  if (venue.highlights.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: venue.highlights.take(3).map((tag) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primarySoft,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            tag,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryDark,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                  if (venue.address != null && venue.address!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            venue.address!,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
