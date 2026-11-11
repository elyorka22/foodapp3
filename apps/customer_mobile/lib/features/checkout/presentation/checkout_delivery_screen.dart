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
import '../providers/checkout_state.dart';

class CheckoutDeliveryScreen extends ConsumerStatefulWidget {
  const CheckoutDeliveryScreen({super.key});

  @override
  ConsumerState<CheckoutDeliveryScreen> createState() =>
      _CheckoutDeliveryScreenState();
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
    final pickup = checkout.isPickup;

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

    final grandTotal = pickup
        ? subtotal - checkout.promoDiscount
        : checkout.deliveryQuoted
            ? subtotal - checkout.promoDiscount + (checkout.deliveryFee ?? 0)
            : null;

    final primaryLabel = pickup
        ? (grandTotal != null
            ? AppStrings.checkoutPlaceOrderWithTotal(formatSum(grandTotal))
            : AppStrings.placePickupOrder)
        : checkout.deliveryQuoted && grandTotal != null
            ? AppStrings.checkoutPlaceOrderWithTotal(formatSum(grandTotal))
            : AppStrings.calculateDeliveryPrice;

    return CustomerPage(
      title: AppStrings.checkoutStepDelivery,
      subtitle: pickup
          ? AppStrings.fulfillmentPickupHint
          : AppStrings.deliveryPriceHint,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _FulfillmentPicker(
            value: checkout.fulfillment,
            onChanged: (v) =>
                ref.read(checkoutProvider.notifier).setFulfillment(v),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (pickup)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.pickupReady,
                    style: AppTypography.subtitle.copyWith(
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF065F46),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    AppStrings.fulfillmentPickupHint,
                    style: AppTypography.bodySmall.copyWith(
                      color: const Color(0xFF047857),
                    ),
                  ),
                ],
              ),
            )
          else
            DeliveryLocationField(
              quoted: checkout.deliveryQuoted,
              busy: busy,
              onRecalculate: checkout.deliveryQuoted
                  ? () =>
                      ref.read(checkoutProvider.notifier).requestDeliveryQuote()
                  : null,
            ),
          if (checkout.deliveryQuoted) ...[
            const SizedBox(height: AppSpacing.lg),
            CustomerCard(
              child: CheckoutTotals(
                subtotal: subtotal,
                promoDiscount: checkout.promoDiscount,
                deliveryFee: pickup ? 0 : checkout.deliveryFee,
              ),
            ),
          ],
          if (!pickup &&
              checkout.deliveryError != null &&
              !checkout.deliveryQuoted) ...[
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
          if (pickup || checkout.deliveryQuoted)
            FoodAppButton(
              label:
                  checkout.placingOrder ? AppStrings.placingOrder : primaryLabel,
              isLoading: checkout.placingOrder,
              onPressed: busy ? null : _placeOrder,
            )
          else
            FoodAppButton(
              label: busy ? AppStrings.deliveryCalculating : primaryLabel,
              isLoading: busy,
              onPressed: busy
                  ? null
                  : () =>
                      ref.read(checkoutProvider.notifier).requestDeliveryQuote(),
            ),
        ],
      ),
    );
  }
}

class _FulfillmentPicker extends StatelessWidget {
  const _FulfillmentPicker({
    required this.value,
    required this.onChanged,
  });

  final FulfillmentMethod value;
  final ValueChanged<FulfillmentMethod> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE4E4E7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.fulfillmentTitle,
            style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _Option(
                  title: AppStrings.deliveryLabel,
                  subtitle: AppStrings.fulfillmentDeliveryHint,
                  selected: value == FulfillmentMethod.delivery,
                  onTap: () => onChanged(FulfillmentMethod.delivery),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _Option(
                  title: AppStrings.pickupLabel,
                  subtitle: AppStrings.fulfillmentPickupHint,
                  selected: value == FulfillmentMethod.pickup,
                  badge: AppStrings.freeBadge,
                  onTap: () => onChanged(FulfillmentMethod.pickup),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Option extends StatelessWidget {
  const _Option({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
    this.badge,
  });

  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.textPrimary : const Color(0xFFFAFAFA),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.textPrimary : const Color(0xFFE4E4E7),
            ),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      color: selected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: AppTypography.caption.copyWith(
                      fontSize: 11,
                      height: 1.25,
                      color: selected
                          ? Colors.white.withOpacity(0.8)
                          : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              if (badge != null)
                Positioned(
                  right: -4,
                  top: -10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      badge!.toUpperCase(),
                      style: AppTypography.caption.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 9,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
