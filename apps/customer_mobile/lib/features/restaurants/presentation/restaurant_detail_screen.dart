import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/restaurants_provider.dart';

class RestaurantDetailScreen extends ConsumerWidget {
  const RestaurantDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(restaurantDetailProvider(slug));

    return restaurant.when(
      data: (r) => _RestaurantDetailBody(restaurant: r),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('$e')),
      ),
    );
  }
}

class _RestaurantDetailBody extends ConsumerWidget {
  const _RestaurantDetailBody({required this.restaurant});

  final RestaurantModel restaurant;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(restaurantProductsProvider(restaurant.id));
    final products = restaurant.products ?? productsAsync.value ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(restaurant.name),
              background: _cover(),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (restaurant.description != null)
                    Text(restaurant.description!, style: AppTypography.bodySmall),
                  const SizedBox(height: AppSpacing.lg),
                  Text(AppStrings.categories, style: AppTypography.subtitle),
                ],
              ),
            ),
          ),
          SliverList(
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
                return ListTile(
                  leading: p.imageUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: p.imageUrl!,
                            width: 48,
                            height: 48,
                            fit: BoxFit.cover,
                          ),
                        )
                      : const Icon(Icons.fastfood_outlined),
                  title: Text(p.name),
                  subtitle: Text('${p.price} UZS'),
                  trailing: qty > 0
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline),
                              onPressed: () => ref.read(cartProvider.notifier).decrement(p.id),
                            ),
                            Text('$qty'),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline),
                              onPressed: () => _add(ref, p),
                            ),
                          ],
                        )
                      : IconButton(
                          icon: const Icon(Icons.add_shopping_cart),
                          onPressed: () => _add(ref, p),
                        ),
                );
              },
              childCount: products.length,
            ),
          ),
        ],
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

  Widget _cover() {
    final url = restaurant.coverUrl ?? restaurant.logoUrl;
    if (url != null) {
      return CachedNetworkImage(imageUrl: url, fit: BoxFit.cover);
    }
    return Container(color: AppColors.primarySoft);
  }
}
