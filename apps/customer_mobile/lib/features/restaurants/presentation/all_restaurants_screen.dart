import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_framing.dart';
import '../../../core/utils/restaurant_card_meta.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../features/cities/providers/selected_city_provider.dart';
import '../../../shared/models/dish_category_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/restaurant_list_card.dart';
import '../providers/dish_categories_provider.dart';
import '../providers/restaurants_provider.dart';

enum _FilterChip { all, fast, pickup, promos }

class AllRestaurantsScreen extends ConsumerStatefulWidget {
  const AllRestaurantsScreen({super.key});

  @override
  ConsumerState<AllRestaurantsScreen> createState() =>
      _AllRestaurantsScreenState();
}

class _AllRestaurantsScreenState extends ConsumerState<AllRestaurantsScreen> {
  final _searchController = TextEditingController();
  bool _searchOpen = false;
  String _query = '';
  String? _activeCategory;
  _FilterChip _chip = _FilterChip.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<RestaurantModel> _filter(List<RestaurantModel> source) {
    var list = List<RestaurantModel>.from(source);
    final q = _query.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((r) => r.name.toLowerCase().contains(q)).toList();
    }
    if (_activeCategory != null) {
      final anyHasCats = source.any((r) => (r.categories ?? []).isNotEmpty);
      if (anyHasCats) {
        list = list
            .where(
              (r) => (r.categories ?? []).any(
                (c) => c.slug == _activeCategory || c.id == _activeCategory,
              ),
            )
            .toList();
      }
    }
    if (_chip == _FilterChip.fast) {
      list.sort((a, b) => restaurantPrepMinutes(a) - restaurantPrepMinutes(b));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final restaurants = ref.watch(restaurantsListProvider(null));
    final categories = ref.watch(dishCategoriesProvider);
    final city = ref.watch(selectedCityProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(restaurantsListProvider);
            ref.invalidate(dishCategoriesProvider);
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
                        hintText: AppStrings.searchRestaurants,
                        prefixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: const Color(0xFFF4F4F5),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onChanged: (v) => setState(() => _query = v),
                    ),
                  ),
                ),
              SliverToBoxAdapter(
                child: categories.when(
                  data: (list) => _cuisineRow(list),
                  loading: () => const SizedBox(height: 8),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ),
              SliverToBoxAdapter(child: _filterChips()),
              restaurants.when(
                data: (list) {
                  final filtered = _filter(list);
                  if (filtered.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Text(
                          AppStrings.restaurantsComingSoon,
                          style: AppTypography.body,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    );
                  }
                  return SliverPadding(
                    padding: scrollSafePadding(
                      context,
                      base: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        AppSpacing.md,
                        AppSpacing.lg,
                        AppSpacing.xl,
                      ),
                    ),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: AppSpacing.lg),
                      itemBuilder: (_, i) {
                        final r = filtered[i];
                        return RestaurantListCard(
                          restaurant: r,
                          onTap: () => context.push('/restaurants/${r.slug}'),
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
                    child: Text(
                      ApiException.formatError(e),
                      style: AppTypography.bodySmall,
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
            onPressed: () => context.pop(),
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
                  AppStrings.restaurants,
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

  Widget _cuisineRow(List<DishCategoryModel> categories) {
    if (categories.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final cat = categories[i];
          final active = _activeCategory == cat.slug;
          final img = cat.resolvedImageUrl;
          return GestureDetector(
            onTap: () => setState(() {
              _activeCategory = active ? null : cat.slug;
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
                      border: Border.all(
                        color: active ? AppColors.primary : AppColors.borderStrong,
                        width: active ? 2 : 1.25,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: img != null
                        ? applyImageFraming(
                            imageScale: cat.imageScale,
                            imagePositionX: cat.imagePositionX,
                            imagePositionY: cat.imagePositionY,
                            fit: BoxFit.contain,
                            letterboxColor: const Color(0xFFF4F4F5),
                            child: CachedNetworkImage(
                              imageUrl: img,
                              fit: BoxFit.contain,
                              errorWidget: (_, __, ___) => Center(
                                child: Text(
                                  cat.name.isNotEmpty ? cat.name[0] : '?',
                                  style: AppTypography.subtitle,
                                ),
                              ),
                            ),
                          )
                        : Center(
                            child: Text(
                              cat.name.isNotEmpty ? cat.name[0] : '?',
                              style: AppTypography.subtitle,
                            ),
                          ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    cat.name,
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
    Widget chip({
      required String label,
      required bool active,
      required VoidCallback onTap,
      IconData? icon,
    }) {
      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: FilterChip(
          selected: active,
          showCheckmark: false,
          avatar: icon == null
              ? null
              : Icon(icon, size: 14, color: active ? Colors.white : AppColors.textPrimary),
          label: Text(
            label,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w800,
              color: active ? Colors.white : AppColors.textPrimary,
            ),
          ),
          selectedColor: AppColors.textPrimary,
          backgroundColor: AppColors.surface,
          side: BorderSide(
            color: active ? AppColors.textPrimary : AppColors.borderStrong,
            width: 1.25,
          ),
          onSelected: (_) => onTap(),
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
          Container(
            width: 36,
            height: 36,
            margin: const EdgeInsets.only(right: 8),
            decoration: const BoxDecoration(
              color: Color(0xFFF4F4F5),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.tune, size: 16),
          ),
          chip(
            label: AppStrings.filterFast,
            icon: Icons.bolt,
            active: _chip == _FilterChip.fast,
            onTap: () => setState(() {
              _chip = _chip == _FilterChip.fast
                  ? _FilterChip.all
                  : _FilterChip.fast;
            }),
          ),
          chip(
            label: AppStrings.pickupLabel,
            icon: Icons.shopping_bag_outlined,
            active: _chip == _FilterChip.pickup,
            onTap: () => setState(() {
              _chip = _chip == _FilterChip.pickup
                  ? _FilterChip.all
                  : _FilterChip.pickup;
            }),
          ),
          chip(
            label: AppStrings.filterPromos,
            active: _chip == _FilterChip.promos,
            onTap: () => setState(() {
              _chip = _chip == _FilterChip.promos
                  ? _FilterChip.all
                  : _FilterChip.promos;
            }),
          ),
        ],
      ),
    );
  }
}
