import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_url.dart';
import '../../../core/utils/restaurant_card_meta.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../features/cities/providers/selected_city_provider.dart';
import '../../../shared/models/business_model.dart';
import '../providers/stores_provider.dart';

const _typeTitles = <String, String>{
  'flowers': AppStrings.homeServiceFlowers,
  'perfume': AppStrings.homeServiceCosmetics,
  'pharmacy': AppStrings.homeServicePharmacy,
  'grocery': AppStrings.homeServiceProducts,
  'gift': "Sovg'alar",
  'electronics': 'Elektronika',
};

enum _Chip { all, freeDelivery, fast }

/// Vertical shop directory for one store type (flowers, grocery, …).
/// Shop tap opens [StoreDetailScreen] catalog. Hub grid kept in store_type_hub_screen.
class StoreTypeDirectoryScreen extends ConsumerStatefulWidget {
  const StoreTypeDirectoryScreen({
    super.key,
    required this.typeSlug,
    this.titleOverride,
  });

  final String typeSlug;
  final String? titleOverride;

  @override
  ConsumerState<StoreTypeDirectoryScreen> createState() =>
      _StoreTypeDirectoryScreenState();
}

class _StoreTypeDirectoryScreenState
    extends ConsumerState<StoreTypeDirectoryScreen> {
  final _searchController = TextEditingController();
  bool _searchOpen = false;
  String _search = '';
  _Chip _chip = _Chip.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String get _title =>
      widget.titleOverride ??
      _typeTitles[widget.typeSlug] ??
      widget.typeSlug;

  List<BusinessModel> _filter(List<BusinessModel> source) {
    var list = List<BusinessModel>.from(source);
    if (_chip == _Chip.fast) {
      list.sort((a, b) => businessPrepMinutes(a) - businessPrepMinutes(b));
    }
    if (_chip == _Chip.freeDelivery) {
      list = list.where((s) {
        final n = s.minOrderAmount;
        return n == null || n <= 0;
      }).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(selectedCityProvider);
    final search = _search.trim();
    final stores = ref.watch(
      storesListProvider(
        StoresQuery(
          typeSlug: widget.typeSlug,
          search: search.isEmpty ? null : search,
        ),
      ),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(storesListProvider);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(child: _header(city?.name)),
              if (_searchOpen)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.sm,
                    ),
                    child: TextField(
                      controller: _searchController,
                      autofocus: true,
                      decoration: InputDecoration(
                        hintText: AppStrings.searchStores,
                        prefixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                        ),
                      ),
                      onChanged: (v) => setState(() => _search = v.trim()),
                    ),
                  ),
                ),
              SliverToBoxAdapter(child: _filterChips()),
              stores.when(
                data: (list) {
                  final filtered = _filter(list);
                  if (filtered.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Text(
                          AppStrings.storesComingSoon,
                          textAlign: TextAlign.center,
                          style: AppTypography.body,
                        ),
                      ),
                    );
                  }
                  return SliverPadding(
                    padding: scrollSafePadding(
                      context,
                      base: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        AppSpacing.sm,
                        AppSpacing.lg,
                        AppSpacing.xl,
                      ),
                    ),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1, color: Color(0xFFF4F4F5)),
                      itemBuilder: (_, i) {
                        final s = filtered[i];
                        return _DirectoryShopRow(
                          store: s,
                          index: i,
                          onTap: () =>
                              context.push(AppRoutes.storeDetail(s.slug)),
                        );
                      },
                    ),
                  );
                },
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),
                error: (e, _) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Text('$e', style: AppTypography.bodySmall),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _header(String? cityName) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.sm,
        AppSpacing.sm,
        AppSpacing.sm,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go(AppRoutes.restaurants);
              }
            },
            icon: const Icon(Icons.chevron_left, size: 28),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cityName ?? AppStrings.navHome,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                Text(
                  _title,
                  style: AppTypography.title.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 22,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _searchOpen = !_searchOpen),
            icon: const Icon(Icons.search, size: 24),
          ),
        ],
      ),
    );
  }

  Widget _filterChips() {
    Widget chip(String label, _Chip value, {IconData? icon}) {
      final active = _chip == value;
      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: FilterChip(
          selected: active,
          showCheckmark: false,
          avatar: icon == null
              ? null
              : Icon(
                  icon,
                  size: 14,
                  color: active ? Colors.white : AppColors.textPrimary,
                ),
          label: Text(
            label,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w800,
              color: active ? Colors.white : AppColors.textPrimary,
            ),
          ),
          selectedColor: AppColors.textPrimary,
          backgroundColor: Colors.white,
          side: const BorderSide(color: Color(0xFFE4E4E7)),
          onSelected: (_) => setState(() {
            _chip = active ? _Chip.all : value;
          }),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          chip(AppStrings.filterFreeDelivery, _Chip.freeDelivery),
          chip(AppStrings.filterFast, _Chip.fast, icon: Icons.bolt),
        ],
      ),
    );
  }
}

class _DirectoryShopRow extends StatelessWidget {
  const _DirectoryShopRow({
    required this.store,
    required this.index,
    required this.onTap,
  });

  final BusinessModel store;
  final int index;
  final VoidCallback onTap;

  static const _tints = [
    Color(0xFFE8F5E9),
    Color(0xFFE3F2FD),
    Color(0xFFFFF3E0),
    Color(0xFFFCE4EC),
    Color(0xFFE0F7FA),
    Color(0xFFFFF8E1),
  ];

  @override
  Widget build(BuildContext context) {
    final logo = resolveImageUrl(store.logoUrl ?? store.coverUrl);
    final delivery = businessDeliveryLabel(store);
    final rating = store.averageRating;
    final min = store.minOrderAmount;
    final minLabel = min == null
        ? null
        : AppStrings.orderFromAmount(min.round().toString());

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: SizedBox(
                width: 72,
                height: 72,
                child: logo != null && logo.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: logo,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => _fallback(),
                      )
                    : _fallback(),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          store.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.subtitle.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      if (rating != null) ...[
                        const Icon(
                          Icons.star_rounded,
                          size: 14,
                          color: Color(0xFFFBBF24),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          rating.toStringAsFixed(1).replaceAll('.', ','),
                          style: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.directions_walk,
                        size: 15,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          [delivery, if (minLabel != null) minLabel].join(' · '),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fallback() {
    return ColoredBox(
      color: _tints[index % _tints.length],
      child: Center(
        child: Text(
          store.name.isNotEmpty ? store.name[0].toUpperCase() : 'D',
          style: AppTypography.title.copyWith(color: AppColors.textMuted),
        ),
      ),
    );
  }
}
