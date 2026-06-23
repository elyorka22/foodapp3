import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/widgets/checkout_totals.dart';
import '../../../shared/widgets/customer_page.dart';
import '../../../shared/widgets/delivery_location_field.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/checkout_provider.dart';

class CheckoutDeliveryScreen extends ConsumerStatefulWidget {
  const CheckoutDeliveryScreen({super.key});

  @override
  ConsumerState<CheckoutDeliveryScreen> createState() => _CheckoutDeliveryScreenState();
}

class _CheckoutDeliveryScreenState extends ConsumerState<CheckoutDeliveryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final phone = ref.read(checkoutProvider).phone;
      if (!isValidUzPhone(normalizePhone(phone))) {
        context.go(AppRoutes.checkout);
      }
    });
  }

  Future<void> _placeOrder() async {
    final token = await ref.read(checkoutProvider.notifier).submitOrder();
    if (!mounted || token == null) return;
    if (token.isNotEmpty) {
      context.go('${AppRoutes.orderTrack}/$token');
    } else {
      context.go(AppRoutes.restaurants);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final checkout = ref.watch(checkoutProvider);
    final subtotal = ref.watch(cartProvider.notifier).total;
    final busy = checkout.deliveryCalculating || checkout.placingOrder;

    if (cart.isEmpty) {
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

    final grandTotal = checkout.deliveryQuoted
        ? subtotal - checkout.promoDiscount + checkout.deliveryFee!
        : null;

    final primaryLabel = checkout.deliveryQuoted && grandTotal != null
        ? AppStrings.checkoutPlaceOrderWithTotal(formatSum(grandTotal))
        : AppStrings.calculateDeliveryPrice;

    return CustomerPage(
      title: AppStrings.checkoutStepDelivery,
      subtitle: AppStrings.deliveryPriceHint,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DeliveryLocationField(
            quoted: checkout.deliveryQuoted,
            busy: busy,
            onRecalculate: checkout.deliveryQuoted
                ? () => ref.read(checkoutProvider.notifier).requestDeliveryQuote()
                : null,
          ),
          if (checkout.deliveryQuoted) ...[
            const SizedBox(height: AppSpacing.lg),
            CustomerCard(
              child: CheckoutTotals(
                subtotal: subtotal,
                promoDiscount: checkout.promoDiscount,
                deliveryFee: checkout.deliveryFee,
              ),
            ),
          ],
          if (checkout.deliveryError != null && !checkout.deliveryQuoted) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              checkout.deliveryError!,
              style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
            ),
          ],
          if (checkout.error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              checkout.error!,
              style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
            ),
          ],
          const SizedBox(height: AppSpacing.xxl),
          if (checkout.deliveryQuoted)
            FoodAppButton(
              label: checkout.placingOrder ? AppStrings.placingOrder : primaryLabel,
              isLoading: checkout.placingOrder,
              onPressed: busy ? null : _placeOrder,
            )
          else
            FoodAppButton(
              label: busy ? AppStrings.deliveryCalculating : primaryLabel,
              isLoading: busy,
              onPressed: busy ? null : () => ref.read(checkoutProvider.notifier).requestDeliveryQuote(),
            ),
        ],
      ),
    );
  }
}
