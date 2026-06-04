import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/customer_page.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final total = ref.watch(cartProvider.notifier).total;

    if (items.isEmpty) {
      return CustomerPage(
        child: Column(
          children: [
            const SizedBox(height: 32),
            Text(AppStrings.cartEmpty, style: AppTypography.subtitle),
            const SizedBox(height: AppSpacing.lg),
            GestureDetector(
              onTap: () => context.go(AppRoutes.restaurants),
              child: Text(
                AppStrings.browseRestaurants,
                style: AppTypography.body.copyWith(color: AppColors.primary),
              ),
            ),
          ],
        ),
      );
    }

    return CustomerPage(
      title: AppStrings.cartTitle,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final item in items) ...[
            CustomerCard(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.name, style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w500)),
                        const SizedBox(height: 4),
                        Text(
                          '${item.quantity} × ${formatSum(item.price)}',
                          style: AppTypography.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => ref.read(cartProvider.notifier).remove(item.productId),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      AppStrings.remove,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          Text(
            '${AppStrings.subtotal}: ${formatSum(total)}',
            style: AppTypography.subtitle.copyWith(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(
                child: FoodAppButton(
                  label: AppStrings.clear,
                  variant: FoodAppButtonVariant.secondary,
                  onPressed: () => ref.read(cartProvider.notifier).clear(),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                flex: 2,
                child: FoodAppButton(
                  label: AppStrings.checkout,
                  onPressed: () => context.push(AppRoutes.checkout),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
