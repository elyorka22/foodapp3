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
import '../../orders/presentation/active_order_banner.dart';
import '../../orders/providers/active_order_provider.dart';
import '../providers/cart_provider.dart';
import '../../checkout/providers/checkout_provider.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ref.read(activeOrderProvider.notifier).reload();
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(cartProvider);
    final total = ref.watch(cartProvider.notifier).total;
    final hasActiveOrder = ref.watch(activeOrderProvider) != null;

    if (items.isEmpty) {
      return CustomerPage(
        child: Column(
          children: [
            const ActiveOrderBanner(),
            if (!hasActiveOrder) ...[
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
          ],
        ),
      );
    }

    return CustomerPage(
      title: AppStrings.cartTitle,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const ActiveOrderBanner(),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: FoodAppButton(
                  label: AppStrings.clear,
                  variant: FoodAppButtonVariant.secondary,
                  onPressed: () {
                    ref.read(cartProvider.notifier).clear();
                    ref.read(checkoutProvider.notifier).reset();
                  },
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
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
