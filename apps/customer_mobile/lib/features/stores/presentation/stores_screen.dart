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

enum _StoreChip { all, deliveryDiscount, freeDelivery, fast }

class StoresScreen extends ConsumerStatefulWidget {
  const StoresScreen({super.key, this.initialType});

  final String? initialType;

  @override
  ConsumerState<StoresScreen> createState() => _StoresScreenState();
}

class _StoresScreenState extends ConsumerState<StoresScreen> {
  final _searchController = TextEditingController();
  late String? _selectedType = widget.initialType;
  bool _searchOpen = false;
  String _search = '';
  bool _delivery = true;
  _StoreChip _chip = _StoreChip.all;

  @override
  void didUpdateWidget(covariant StoresScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialType != widget.initialType) {
      _selectedType = widget.initialType;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<BusinessModel> _filter(List<BusinessModel> source) {
    var list = List<BusinessModel>.from(source);
    final q = _search.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((s) => s.name.toLowerCase().contains(q)).toList();
    }
    if (_chip == _StoreChip.fast) {
      list.sort((a, b) => businessPrepMinutes(a) - businessPrepMinutes(b));
    }
    if (_chip == _StoreChip.freeDelivery) {
      list = list.where((s) {
        final n = s.minOrderAmount;
        return n == null || n <= 0;
      }).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final types = ref.watch(businessTypesProvider);
    final city = ref.watch(selectedCityProvider);
    final query = StoresQuery(
      search: _search.isEmpty ? null : _search,
      typeSlug: _selectedType,
    );
    final stores = ref.watch(storesListProvider(query));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(businessTypesProvider);
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
                        fillColor: const Color(0xFFF4F4F5),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onChanged: (v) => setState(() => _search = v.trim()),
                    ),
                  ),
                ),
              SliverToBoxAdapter(child: _fulfillmentToggle()),
              SliverToBoxAdapter(
                child: types.when(
                  data: (list) => _typeCircles(
                    list.where((t) => t.slug != 'restaurant').toList(),
                  ),
                  loading: () => const SizedBox(height: 8),
                  error: (_, __) => const SizedBox.shrink(),
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
                        return _ShopRow(
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
                  AppStrings.navStores,
                  style: AppTypography.title.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
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

  Widget _fulfillmentToggle() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFFF4F4F5),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          children: [
            Expanded(
              child: _toggleBtn(
                label: AppStrings.deliveryLabel,
                active: _delivery,
                onTap: () => setState(() => _delivery = true),
              ),
            ),
            Expanded(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  _toggleBtn(
                    label: AppStrings.pickupLabel,
                    active: !_delivery,
                    onTap: () => setState(() => _delivery = false),
                  ),
                  Positioned(
                    right: 8,
                    top: -6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        AppStrings.freeBadge.toUpperCase(),
                        style: AppTypography.caption.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 9,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _toggleBtn({
    required String label,
    required bool active,
    required VoidCallback onTap,
  }) {
    return Material(
      color: active ? AppColors.textPrimary : Colors.transparent,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w800,
              color: active ? Colors.white : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _typeCircles(List<BusinessTypeModel> types) {
    if (types.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: types.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final t = types[i];
          final active = _selectedType == t.slug;
          final img = resolveImageUrl(t.imageUrl);
          return GestureDetector(
            onTap: () => setState(() {
              _selectedType = active ? null : t.slug;
            }),
            child: SizedBox(
              width: 72,
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFF4F4F5),
                      border: active
                          ? Border.all(color: AppColors.primary, width: 2)
                          : null,
                    ),
                    clipBehavior: Clip.antiAlias,
                    alignment: Alignment.center,
                    child: img != null && img.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: img,
                            fit: BoxFit.contain,
                            errorWidget: (_, __, ___) => Text(
                              (t.icon?.trim().isNotEmpty == true)
                                  ? t.icon!
                                  : t.name[0],
                              style: AppTypography.subtitle,
                            ),
                          )
                        : Text(
                            (t.icon?.trim().isNotEmpty == true)
                                ? t.icon!
                                : t.name[0],
                            style: AppTypography.subtitle,
                          ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    t.name,
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 11,
                      height: 1.15,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _filterChips() {
    Widget chip(String label, _StoreChip value, {IconData? icon}) {
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
          backgroundColor: const Color(0xFFF4F4F5),
          side: BorderSide.none,
          onSelected: (_) => setState(() {
            _chip = active ? _StoreChip.all : value;
          }),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          chip(AppStrings.filterDeliveryDiscount, _StoreChip.deliveryDiscount),
          chip(AppStrings.filterFreeDelivery, _StoreChip.freeDelivery),
          chip(AppStrings.filterFast, _StoreChip.fast, icon: Icons.bolt),
        ],
      ),
    );
  }
}

class _ShopRow extends StatelessWidget {
  const _ShopRow({
    required this.store,
    required this.index,
    required this.onTap,
  });

  final BusinessModel store;
  final int index;
  final VoidCallback onTap;

  static const _tints = [
    Color(0xFF16A34A),
    Color(0xFF2563EB),
    Color(0xFFDC2626),
    Color(0xFFEA580C),
    Color(0xFF1D4ED8),
    Color(0xFFCA8A04),
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
                  if (store.businessType?.name != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      store.businessType!.name,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
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

  Widget _fallback() {
    return ColoredBox(
      color: _tints[index % _tints.length],
      child: Center(
        child: Text(
          store.name.isNotEmpty ? store.name[0].toUpperCase() : 'D',
          style: AppTypography.title.copyWith(color: Colors.white),
        ),
      ),
    );
  }
}
