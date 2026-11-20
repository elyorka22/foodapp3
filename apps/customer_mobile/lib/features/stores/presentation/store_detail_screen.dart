import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/brand_loading_pill.dart';
import '../../../shared/widgets/store_category_grid.dart';
import '../../../shared/widgets/store_product_card.dart';
import '../../cart/providers/cart_provider.dart';
import '../../restaurants/providers/restaurants_provider.dart';

/// Store menu — matches web `store-menu-screen.tsx`.
class StoreDetailScreen extends ConsumerStatefulWidget {
  const StoreDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<StoreDetailScreen> createState() => _StoreDetailScreenState();
}

class _StoreDetailScreenState extends ConsumerState<StoreDetailScreen> {
  String _activeCategoryId = 'all';

  @override
  Widget build(BuildContext context) {
    final business = ref.watch(restaurantDetailProvider(widget.slug));

    return business.when(
      data: (r) => _StoreMenuBody(
        business: r,
        activeCategoryId: _activeCategoryId,
        onCategoryChanged: (id) => setState(() => _activeCategoryId = id),
      ),
      loading: () => const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: BrandLoadingPill()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('$e')),
      ),
    );
  }
}

class _StoreMenuBody extends ConsumerStatefulWidget {
  const _StoreMenuBody({
    required this.business,
    required this.activeCategoryId,
    required this.onCategoryChanged,
  });

  final RestaurantModel business;
  final String activeCategoryId;
  final ValueChanged<String> onCategoryChanged;

  @override
  ConsumerState<_StoreMenuBody> createState() => _StoreMenuBodyState();
}

class _StoreMenuBodyState extends ConsumerState<_StoreMenuBody> {
  final _searchController = TextEditingController();
  String _search = '';
  bool _categoriesExpanded = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ProductModel> _searched(List<ProductModel> products) {
    final q = _search.trim().toLowerCase();
    if (q.isEmpty) return products;
    return products.where((p) => p.name.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final business = widget.business;
    final productsAsync = ref.watch(restaurantProductsProvider(business.id));
    final allProducts = business.products ?? productsAsync.value ?? [];
    final searched = _searched(allProducts);
    final categories = business.categories ?? [];
    final closed = business.isOpen == false;
    final cartCount = ref.watch(
      cartProvider.select((c) => c.fold(0, (s, i) => s + i.quantity)),
    );

    final discounted = searched
        .where(
          (p) =>
              p.comparePrice != null &&
              p.comparePrice!.toDouble() > p.price.toDouble(),
        )
        .toList();

    final sections = <({RestaurantCategoryModel category, List<ProductModel> products})>[];
    if (widget.activeCategoryId == 'all') {
      for (final cat in categories) {
        final items =
            searched.where((p) => p.categoryId == cat.id).toList();
        if (items.isNotEmpty) {
          sections.add((category: cat, products: items));
        }
      }
      final uncategorized =
          searched.where((p) => p.categoryId == null || p.categoryId!.isEmpty).toList();
      if (uncategorized.isNotEmpty && categories.isEmpty) {
        // fall through to single row below
      }
    } else {
      final cat = categories.where((c) => c.id == widget.activeCategoryId);
      final items =
          searched.where((p) => p.categoryId == widget.activeCategoryId).toList();
      if (cat.isNotEmpty && items.isNotEmpty) {
        sections.add((category: cat.first, products: items));
      } else if (items.isNotEmpty) {
        sections.add((
          category: RestaurantCategoryModel(
            id: widget.activeCategoryId,
            name: AppStrings.shopsTitle,
            slug: widget.activeCategoryId,
          ),
          products: items,
        ));
      }
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.lg,
                          AppSpacing.sm,
                          AppSpacing.lg,
                          0,
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                business.name,
                                style: AppTypography.title.copyWith(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            Material(
                              color: const Color(0xFFF4F4F5),
                              shape: const CircleBorder(),
                              child: InkWell(
                                customBorder: const CircleBorder(),
                                onTap: () => context.pop(),
                                child: const SizedBox(
                                  width: 36,
                                  height: 36,
                                  child: Icon(Icons.close_rounded, size: 18),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                        ),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              TextField(
                                controller: _searchController,
                                decoration: InputDecoration(
                                  hintText:
                                      AppStrings.searchInMenu(business.name),
                                  prefixIcon: const Icon(
                                    Icons.search_rounded,
                                    size: 18,
                                    color: AppColors.textMuted,
                                  ),
                                  filled: true,
                                  fillColor: const Color(0xFFF4F4F5),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 12,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: BorderSide.none,
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: BorderSide.none,
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                                style: const TextStyle(fontSize: 15),
                                onChanged: (v) =>
                                    setState(() => _search = v),
                              ),
                              if (closed)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    AppStrings.deliveryTimeEnded,
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.danger,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              if (categories.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                StoreCategoryGrid(
                                  categories: categories,
                                  limit: _categoriesExpanded ? null : 5,
                                  activeId: widget.activeCategoryId,
                                  onSelectCategory: widget.onCategoryChanged,
                                  allCategoriesImageUrl:
                                      business.allCategoriesImageUrl,
                                  allCategoriesImageScale:
                                      business.allCategoriesImageScale,
                                  allCategoriesImagePositionX:
                                      business.allCategoriesImagePositionX,
                                  allCategoriesImagePositionY:
                                      business.allCategoriesImagePositionY,
                                  onOpenAll: _categoriesExpanded
                                      ? null
                                      : () => setState(
                                            () => _categoriesExpanded = true,
                                          ),
                                ),
                              ],
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                if (searched.isEmpty)
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Text(
                        _search.trim().isNotEmpty
                            ? AppStrings.searchNoResults
                            : AppStrings.menuEmpty,
                        style: AppTypography.bodySmall,
                      ),
                    ),
                  )
                else ...[
                  if (widget.activeCategoryId == 'all' &&
                      discounted.isNotEmpty)
                    SliverToBoxAdapter(
                      child: _ProductRow(
                        title: AppStrings.storeDiscountsForYou,
                        products: discounted,
                        closed: closed,
                        onAdd: (p) => _add(p),
                        onRemove: (id) =>
                            ref.read(cartProvider.notifier).decrement(id),
                      ),
                    ),
                  for (final section in sections)
                    SliverToBoxAdapter(
                      child: _ProductRow(
                        title: section.category.name,
                        products: section.products,
                        closed: closed,
                        onAdd: (p) => _add(p),
                        onRemove: (id) =>
                            ref.read(cartProvider.notifier).decrement(id),
                      ),
                    ),
                  if (sections.isEmpty &&
                      !(widget.activeCategoryId == 'all' &&
                          discounted.isNotEmpty))
                    SliverToBoxAdapter(
                      child: _ProductRow(
                        title: AppStrings.shopsTitle,
                        products: searched,
                        closed: closed,
                        onAdd: (p) => _add(p),
                        onRemove: (id) =>
                            ref.read(cartProvider.notifier).decrement(id),
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ],
            ),
          ),
          if (cartCount > 0)
            Positioned(
              left: 0,
              right: 0,
              bottom: 24 + MediaQuery.paddingOf(context).bottom,
              child: Center(
                child: Material(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(999),
                  elevation: 8,
                  shadowColor: Colors.black38,
                  child: InkWell(
                    onTap: () => context.go(AppRoutes.cart),
                    borderRadius: BorderRadius.circular(999),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 28,
                        vertical: 14,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.shopping_cart_outlined,
                            size: 20,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            AppStrings.cartFab(cartCount),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _add(ProductModel p) {
    ref.read(cartProvider.notifier).addItem(
          productId: p.id,
          name: p.name,
          price: p.price,
          businessId: widget.business.id,
          businessName: widget.business.name,
        );
  }
}

class _ProductRow extends ConsumerWidget {
  const _ProductRow({
    required this.title,
    required this.products,
    required this.closed,
    required this.onAdd,
    required this.onRemove,
  });

  final String title;
  final List<ProductModel> products;
  final bool closed;
  final ValueChanged<ProductModel> onAdd;
  final ValueChanged<String> onRemove;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Text(
              title,
              style: AppTypography.sectionTitle,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 260,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                itemCount: products.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final p = products[index];
                  final qty = ref.watch(
                    cartProvider.select(
                      (items) => items
                          .where((i) => i.productId == p.id)
                          .fold(0, (s, i) => s + i.quantity),
                    ),
                  );
                  return StoreProductCard(
                    product: p,
                    quantity: qty,
                    disabled: closed,
                    onAdd: () => onAdd(p),
                    onRemove: () => onRemove(p.id),
                  );
                },
              ),
          ),
        ],
      ),
    );
  }
}
