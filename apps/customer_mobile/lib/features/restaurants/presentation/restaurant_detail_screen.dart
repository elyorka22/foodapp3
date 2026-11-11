import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_url.dart';
import '../../../shared/models/banner_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/banner_slot_carousel.dart';
import '../../../shared/widgets/business_availability_badge.dart';
import '../../../shared/widgets/circle_icon_button.dart';
import '../../../shared/widgets/menu_product_card.dart';
import '../../../shared/widgets/restaurant_category_tabs.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/restaurants_provider.dart';

class RestaurantDetailScreen extends ConsumerStatefulWidget {
  const RestaurantDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<RestaurantDetailScreen> createState() => _RestaurantDetailScreenState();
}

class _RestaurantDetailScreenState extends ConsumerState<RestaurantDetailScreen> {
  String _activeCategoryId = 'all';

  @override
  Widget build(BuildContext context) {
    final restaurant = ref.watch(restaurantDetailProvider(widget.slug));

    return restaurant.when(
      data: (r) => _RestaurantDetailBody(
        restaurant: r,
        activeCategoryId: _activeCategoryId,
        onCategoryChanged: (id) => setState(() => _activeCategoryId = id),
      ),
      loading: () => const Scaffold(
        backgroundColor: AppColors.pageBackground,
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('$e')),
      ),
    );
  }
}

class _RestaurantDetailBody extends ConsumerStatefulWidget {
  const _RestaurantDetailBody({
    required this.restaurant,
    required this.activeCategoryId,
    required this.onCategoryChanged,
  });

  final RestaurantModel restaurant;
  final String activeCategoryId;
  final ValueChanged<String> onCategoryChanged;

  @override
  ConsumerState<_RestaurantDetailBody> createState() =>
      _RestaurantDetailBodyState();
}

class _RestaurantDetailBodyState extends ConsumerState<_RestaurantDetailBody> {
  final _searchController = TextEditingController();
  bool _searchOpen = false;
  String _search = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ProductModel> _applySearch(List<ProductModel> products) {
    final q = _search.trim().toLowerCase();
    if (q.isEmpty) return products;
    return products.where((p) => p.name.toLowerCase().contains(q)).toList();
  }

  List<ProductModel> _filterProducts(List<ProductModel> products) {
    final searched = _applySearch(products);
    if (widget.activeCategoryId == 'all') return searched;
    return searched
        .where((p) => p.categoryId == widget.activeCategoryId)
        .toList();
  }

  List<({RestaurantCategoryModel category, List<ProductModel> products})>
      _menuSections(
    List<ProductModel> products,
    List<RestaurantCategoryModel> categories,
  ) {
    final searched = _applySearch(products);
    return [
      for (final category in categories)
        (
          category: category,
          products:
              searched.where((p) => p.categoryId == category.id).toList(),
        ),
    ].where((section) => section.products.isNotEmpty).toList();
  }

  List<BannerModel> _restaurantBanners(List<BannerModel> all) {
    return all
        .where((b) => b.restaurantId == widget.restaurant.id)
        .where((b) => resolveImageUrl(b.imageUrl) != null)
        .toList()
      ..sort((a, b) => (a.sortOrder ?? 0).compareTo(b.sortOrder ?? 0));
  }

  @override
  Widget build(BuildContext context) {
    final restaurant = widget.restaurant;
    final productsAsync = ref.watch(restaurantProductsProvider(restaurant.id));
    final bannersAsync = ref.watch(bannersProvider);
    final allProducts = restaurant.products ?? productsAsync.value ?? [];
    final categories = restaurant.categories ?? [];
    final products = _filterProducts(allProducts);
    final menuSections = widget.activeCategoryId == 'all'
        ? _menuSections(allProducts, categories)
        : null;
    final closed = restaurant.isOpen == false;
    final restaurantBanners =
        _restaurantBanners(bannersAsync.valueOrNull ?? const []);
    final logoUrl = resolveImageUrl(restaurant.logoUrl);
    final emptyLabel =
        _search.trim().isNotEmpty ? AppStrings.searchNoResults : AppStrings.menuEmpty;

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleIconButton(
                          icon: Icons.arrow_back_rounded,
                          onTap: () => context.pop(),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: _RestaurantBrandHeader(
                            name: restaurant.name,
                            logoUrl: logoUrl,
                            isOpen: restaurant.isOpen,
                            closesAt: restaurant.closesAt,
                            closingSoon: restaurant.closingSoon ?? false,
                          ),
                        ),
                        CircleIconButton(
                          icon: Icons.search_rounded,
                          onTap: () => setState(() {
                            _searchOpen = !_searchOpen;
                            if (!_searchOpen) {
                              _search = '';
                              _searchController.clear();
                            }
                          }),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        CircleIconButton(
                          icon: Icons.favorite_border_rounded,
                          onTap: () {},
                        ),
                      ],
                    ),
                    if (_searchOpen) ...[
                      const SizedBox(height: AppSpacing.md),
                      TextField(
                        controller: _searchController,
                        autofocus: true,
                        decoration: InputDecoration(
                          hintText: AppStrings.searchInMenu(restaurant.name),
                          prefixIcon: const Icon(Icons.search),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide:
                                const BorderSide(color: Color(0xFFE4E4E7)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide:
                                const BorderSide(color: Color(0xFFE4E4E7)),
                          ),
                        ),
                        onChanged: (v) => setState(() => _search = v),
                      ),
                    ],
                    if (restaurantBanners.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      SizedBox(
                        height: 160,
                        child: BannerSlotCarousel(
                          banners: restaurantBanners,
                          tall: true,
                        ),
                      ),
                    ],
                    if (categories.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      RestaurantCategoryTabs(
                        categories: categories,
                        activeId: widget.activeCategoryId,
                        onChanged: widget.onCategoryChanged,
                      ),
                    ],
                    const SizedBox(height: AppSpacing.lg),
                  ],
                ),
              ),
            ),
            if (products.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Text(
                    emptyLabel,
                    style: AppTypography.bodySmall,
                  ),
                ),
              )
            else if (menuSections != null)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  0,
                  AppSpacing.lg,
                  96,
                ),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, sectionIndex) {
                      final section = menuSections[sectionIndex];
                      return Padding(
                        padding: EdgeInsets.only(
                          bottom: sectionIndex == menuSections.length - 1 ? 0 : AppSpacing.xl,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              section.category.name,
                              style: AppTypography.title.copyWith(fontSize: 18),
                            ),
                            const SizedBox(height: AppSpacing.md),
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 20,
                                mainAxisExtent: 300,
                              ),
                              itemCount: section.products.length,
                              itemBuilder: (context, index) {
                                final p = section.products[index];
                                final qty = ref.watch(
                                  cartProvider.select(
                                    (items) => items
                                        .where((i) => i.productId == p.id)
                                        .fold(0, (s, i) => s + i.quantity),
                                  ),
                                );
                                return MenuProductCard(
                                  product: p,
                                  quantity: qty,
                                  disabled: closed,
                                  onAdd: () => _add(ref, p),
                                  onRemove: () =>
                                      ref.read(cartProvider.notifier).decrement(p.id),
                                );
                              },
                            ),
                          ],
                        ),
                      );
                    },
                    childCount: menuSections.length,
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  0,
                  AppSpacing.lg,
                  96,
                ),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 20,
                    mainAxisExtent: 300,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final p = products[index];
                      final qty = ref.watch(
                        cartProvider.select(
                          (items) => items
                              .where((i) => i.productId == p.id)
                              .fold(0, (s, i) => s + i.quantity),
                        ),
                      );
                      return MenuProductCard(
                        product: p,
                        quantity: qty,
                        disabled: closed,
                        onAdd: () => _add(ref, p),
                        onRemove: () => ref.read(cartProvider.notifier).decrement(p.id),
                      );
                    },
                    childCount: products.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _add(WidgetRef ref, ProductModel p) {
    ref.read(cartProvider.notifier).addItem(
          productId: p.id,
          name: p.name,
          price: p.price,
          businessId: widget.restaurant.id,
          businessName: widget.restaurant.name,
        );
  }
}

class _RestaurantBrandHeader extends StatelessWidget {
  const _RestaurantBrandHeader({
    required this.name,
    required this.logoUrl,
    required this.isOpen,
    required this.closesAt,
    required this.closingSoon,
  });

  final String name;
  final String? logoUrl;
  final bool? isOpen;
  final String? closesAt;
  final bool closingSoon;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (logoUrl != null && logoUrl!.isNotEmpty)
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: CachedNetworkImage(
              imageUrl: logoUrl!,
              height: 48,
              fit: BoxFit.contain,
              alignment: Alignment.centerLeft,
              errorWidget: (_, __, ___) => Text(
                name,
                style: AppTypography.title.copyWith(fontSize: 22),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
        else
          Text(
            name,
            style: AppTypography.title.copyWith(fontSize: 22),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        if (isOpen != null) ...[
          const SizedBox(height: 6),
          BusinessAvailabilityBadge(
            isOpen: isOpen,
            closesAt: closesAt,
            closingSoon: closingSoon,
            compact: true,
          ),
        ],
      ],
    );
  }
}

