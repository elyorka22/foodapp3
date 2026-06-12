import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/image_framing.dart';
import '../../../core/utils/image_url.dart';
import '../providers/booking_provider.dart';

const _bookingBg = Color(0xFF0C0A09);
const _amber = Color(0xFFF59E0B);

class BookingVenueScreen extends ConsumerWidget {
  const BookingVenueScreen({super.key, required this.slug});

  final String slug;

  String _venueTypeLabel(String type) {
    if (type == 'TABLE') return AppStrings.bookingTypeTable;
    if (type == 'HALL') return AppStrings.bookingTypeHall;
    return AppStrings.bookingTypeBoth;
  }

  Future<void> _callPhone(String phone) async {
    final tel = phone.replaceAll(RegExp(r'\s'), '');
    final uri = Uri(scheme: 'tel', path: tel);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final venueAsync = ref.watch(bookingVenueDetailProvider(slug));

    return Scaffold(
      backgroundColor: _bookingBg,
      body: venueAsync.when(
        data: (venue) {
          final cover = resolveImageUrl(venue.coverUrl ?? venue.logoUrl);
          final phone = venue.phone?.trim();

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Stack(
                  children: [
                    AspectRatio(
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
                                    Color(0xFFD97706),
                                    Color(0xFF7C2D12),
                                  ],
                                ),
                              ),
                            ),
                          DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.3),
                                  _bookingBg,
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: _BackChip(
                          onTap: () => context.go(AppRoutes.booking),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SliverToBoxAdapter(
                child: Transform.translate(
                  offset: const Offset(0, -32),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _amber,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _venueTypeLabel(venue.venueType).toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          venue.name,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        if (venue.description != null &&
                            venue.description!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            venue.description!,
                            style: TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: Colors.grey.shade300,
                            ),
                          ),
                        ],
                        if (venue.highlights.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.md),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: venue.highlights.map((tag) {
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: _amber.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _amber.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Text(
                                  tag,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFFFEF3C7),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                        const SizedBox(height: AppSpacing.lg),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.1),
                            ),
                          ),
                          child: Column(
                            children: [
                              if (venue.address != null &&
                                  venue.address!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(
                                    bottom: AppSpacing.md,
                                  ),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.location_on_outlined,
                                        color: _amber,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          venue.address!,
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Colors.grey.shade300,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              if (phone != null && phone.isNotEmpty)
                                SizedBox(
                                  width: double.infinity,
                                  child: FilledButton.icon(
                                    onPressed: () => _callPhone(phone),
                                    icon: const Icon(Icons.phone),
                                    label: const Text(AppStrings.bookingCallToReserve),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: _amber,
                                      foregroundColor: Colors.black,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 14,
                                      ),
                                    ),
                                  ),
                                )
                              else
                                Text(
                                  AppStrings.bookingNoPhone,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xl),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: _amber),
        ),
        error: (_, __) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  AppStrings.bookingVenueNotFound,
                  style: TextStyle(color: Colors.grey.shade300),
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton(
                  onPressed: () => context.go(AppRoutes.booking),
                  child: const Text(AppStrings.back),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BackChip extends StatelessWidget {
  const _BackChip({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.45),
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_back, size: 16, color: Colors.white),
              SizedBox(width: 6),
              Text(
                AppStrings.back,
                style: TextStyle(color: Colors.white, fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
