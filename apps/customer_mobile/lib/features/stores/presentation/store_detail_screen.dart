import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/business_model.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/stores_provider.dart';

class StoreDetailScreen extends ConsumerWidget {
  const StoreDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final store = ref.watch(storeDetailProvider(slug));
    return store.when(
      data: (s) => _StoreBody(store: s),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('$e'))),
    );
  }
}

class _StoreBody extends ConsumerWidget {
  const _StoreBody({required this.store});

  final BusinessModel store;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = store.products ?? [];

    return Scaffold(
      appBar: AppBar(title: Text(store.name)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          if (store.description != null) Text(store.description!, style: AppTypography.bodySmall),
          const SizedBox(height: AppSpacing.lg),
          Text(AppStrings.categories, style: AppTypography.subtitle),
          const SizedBox(height: AppSpacing.md),
          ...products.map((p) {
            final qty = ref.watch(
              cartProvider.select(
                (items) => items.where((i) => i.productId == p.id).fold(0, (s, i) => s + i.quantity),
              ),
            );
            return ListTile(
              title: Text(p.name),
              subtitle: Text('${p.price} UZS'),
              trailing: qty > 0
                  ? Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove),
                          onPressed: () => ref.read(cartProvider.notifier).decrement(p.id),
                        ),
                        Text('$qty'),
                        IconButton(
                          icon: const Icon(Icons.add),
                          onPressed: () => ref.read(cartProvider.notifier).addItem(
                                productId: p.id,
                                name: p.name,
                                price: p.price,
                                businessId: store.id,
                                businessName: store.name,
                              ),
                        ),
                      ],
                    )
                  : IconButton(
                      icon: const Icon(Icons.add_shopping_cart),
                      onPressed: () => ref.read(cartProvider.notifier).addItem(
                            productId: p.id,
                            name: p.name,
                            price: p.price,
                            businessId: store.id,
                            businessName: store.name,
                          ),
                    ),
            );
          }),
        ],
      ),
    );
  }
}
