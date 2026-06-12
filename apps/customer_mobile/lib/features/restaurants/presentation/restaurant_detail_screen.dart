import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/business_availability_badge.dart';
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
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('$e')),
      ),
    );
  }
}

class _RestaurantDetailBody extends ConsumerWidget {
  const _RestaurantDetailBody({
    required this.restaurant,
    required this.activeCategoryId,
    required this.onCategoryChanged,
  });

  final RestaurantModel restaurant;
  final String activeCategoryId;
  final ValueChanged<String> onCategoryChanged;

  List<ProductModel> _filterProducts(List<ProductModel> products) {
    if (activeCategoryId == 'all') return products;
    return products.where((p) => p.categoryId == activeCategoryId).toList();
  }

  List<({RestaurantCategoryModel category, List<ProductModel> products})> _menuSections(
    List<ProductModel> products,
    List<RestaurantCategoryModel> categories,
  ) {
    return [
      for (final category in categories)
        (
          category: category,
          products: products.where((p) => p.categoryId == category.id).toList(),
        ),
    ].where((section) => section.products.isNotEmpty).toList();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(restaurantProductsProvider(restaurant.id));
    final allProducts = restaurant.products ?? productsAsync.value ?? [];
    final categories = restaurant.categories ?? [];
    final products = _filterProducts(allProducts);
    final menuSections =
        activeCategoryId == 'all' ? _menuSections(allProducts, categories) : null;
    final closed = restaurant.isOpen == false;

    return Scaffold(
      backgroundColor: AppColors.background,
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
                      children: [
                        _IconCircleButton(
                          icon: Icons.arrow_back,
                          onTap: () => context.pop(),
                        ),
                        const Spacer(),
                        _IconCircleButton(icon: Icons.search, onTap: () {}),
                        const SizedBox(width: AppSpacing.sm),
                        _IconCircleButton(
                          icon: Icons.favorite_border,
                          onTap: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      restaurant.name,
                      style: AppTypography.title.copyWith(fontSize: 26),
                    ),
                    if (restaurant.isOpen != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      BusinessAvailabilityBanner(
                        isOpen: restaurant.isOpen,
                        closesAt: restaurant.closesAt,
                        closingSoon: restaurant.closingSoon ?? false,
                      ),
                    ],
                    const SizedBox(height: AppSpacing.lg),
                    RestaurantCategoryTabs(
                      categories: categories,
                      activeId: activeCategoryId,
                      onChanged: onCategoryChanged,
                    ),
                  ],
                ),
              ),
            ),
            if (products.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Text(
                    AppStrings.menuEmpty,
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
                  AppSpacing.xxxl,
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
                  AppSpacing.xxxl,
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
          businessId: restaurant.id,
          businessName: restaurant.name,
        );
  }
}

class _IconCircleButton extends StatelessWidget {
  const _IconCircleButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 1,
      shadowColor: Colors.black26,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(icon, size: 22, color: AppColors.textPrimary),
        ),
      ),
    );
  }
}
