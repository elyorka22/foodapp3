import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final total = ref.watch(cartProvider.notifier).total;

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.cartTitle, style: AppTypography.title)),
      body: items.isEmpty
          ? Center(
              child: Text(AppStrings.cartEmpty, style: AppTypography.body),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (_, i) {
                      final item = items[i];
                      return FoodAppCard(
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.name, style: AppTypography.subtitle),
                                  Text('${item.price} UZS', style: AppTypography.caption),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline),
                              onPressed: () =>
                                  ref.read(cartProvider.notifier).decrement(item.productId),
                            ),
                            Text('${item.quantity}', style: AppTypography.subtitle),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline),
                              onPressed: () => ref.read(cartProvider.notifier).addItem(
                                    productId: item.productId,
                                    name: item.name,
                                    price: item.price,
                                    businessId: item.businessId,
                                    businessName: item.businessName,
                                  ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(AppStrings.total, style: AppTypography.subtitle),
                          Text('${total.toStringAsFixed(0)} UZS', style: AppTypography.title),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      FoodAppButton(
                        label: AppStrings.checkout,
                        onPressed: () => context.push(AppRoutes.checkout),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
