import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/menu_product_card.dart';
import '../../../shared/widgets/restaurant_category_tabs.dart';
import '../../cart/providers/cart_provider.dart';
import '../../restaurants/providers/restaurants_provider.dart';

/// Store menu — same layout as restaurant (catalog only).
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
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('$e')),
      ),
    );
  }
}

class _StoreMenuBody extends ConsumerWidget {
  const _StoreMenuBody({
    required this.business,
    required this.activeCategoryId,
    required this.onCategoryChanged,
  });

  final RestaurantModel business;
  final String activeCategoryId;
  final ValueChanged<String> onCategoryChanged;

  List<ProductModel> _filterProducts(List<ProductModel> products) {
    if (activeCategoryId == 'all') return products;
    return products.where((p) => p.categoryId == activeCategoryId).toList();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(restaurantProductsProvider(business.id));
    final allProducts = business.products ?? productsAsync.value ?? [];
    final products = _filterProducts(allProducts);
    final categories = business.categories ?? [];
    final closed = business.isOpen == false;

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
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      business.name,
                      style: AppTypography.title.copyWith(fontSize: 26),
                    ),
                    if (closed) ...[
                      const SizedBox(height: AppSpacing.md),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF7ED),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          AppStrings.restaurantClosed,
                          style: AppTypography.bodySmall.copyWith(
                            color: const Color(0xFF92400E),
                          ),
                        ),
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
                  child: Text(AppStrings.menuEmpty, style: AppTypography.bodySmall),
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
          businessId: business.id,
          businessName: business.name,
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
