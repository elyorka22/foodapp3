import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/widgets/checkout_dual_actions.dart';
import '../../../shared/widgets/checkout_promo_card.dart';
import '../../../shared/widgets/customer_page.dart';
import '../../../shared/widgets/uz_phone_field.dart';
import '../../auth/providers/auth_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/checkout_provider.dart';

class CheckoutDetailsScreen extends ConsumerStatefulWidget {
  const CheckoutDetailsScreen({super.key});

  @override
  ConsumerState<CheckoutDetailsScreen> createState() => _CheckoutDetailsScreenState();
}

class _CheckoutDetailsScreenState extends ConsumerState<CheckoutDetailsScreen> {
  late final TextEditingController _phone;
  late final TextEditingController _promo;
  var _initialized = false;

  @override
  void initState() {
    super.initState();
    _phone = TextEditingController();
    _promo = TextEditingController();
  }

  @override
  void dispose() {
    _phone.dispose();
    _promo.dispose();
    super.dispose();
  }

  void _continue() {
    final phone = normalizePhone(_phone.text);
    if (!isValidUzPhone(phone)) {
      ref.read(checkoutProvider.notifier).setError(AppStrings.checkoutEnterPhone);
      return;
    }
    ref.read(checkoutProvider.notifier)
      ..setPhone(_phone.text)
      ..setPromoCode(_promo.text)
      ..setError(null);
    context.push(AppRoutes.checkoutDelivery);
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      _initialized = true;
      final checkout = ref.read(checkoutProvider);
      final userPhone = ref.read(authStateProvider).valueOrNull?.phone;
      if (checkout.phone.isNotEmpty) {
        setUzPhoneController(_phone, checkout.phone);
      } else if (userPhone != null) {
        setUzPhoneController(_phone, userPhone);
        ref.read(checkoutProvider.notifier).setPhone(userPhone);
      }
      if (checkout.promoCode.isNotEmpty) {
        _promo.text = checkout.promoCode;
      }
    }

    final cart = ref.watch(cartProvider);
    final checkout = ref.watch(checkoutProvider);
    final businessId = ref.read(cartProvider.notifier).businessId;
    final phoneValid = isValidUzPhone(normalizePhone(_phone.text));

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

    return CustomerPage(
      title: AppStrings.checkoutStepDetails,
      subtitle: AppStrings.checkoutTitle,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CheckoutPromoCard(
            controller: _promo,
            validating: checkout.validatingPromo,
            message: checkout.promoMessage,
            initialOpen: true,
            onApply: checkout.validatingPromo || businessId == null
                ? null
                : () {
                    ref.read(checkoutProvider.notifier).setPromoCode(_promo.text);
                    ref.read(checkoutProvider.notifier).applyPromo();
                  },
          ),
          const SizedBox(height: AppSpacing.lg),
          UzPhoneField(
            controller: _phone,
            hint: AppStrings.phonePlaceholder,
            onChanged: (value) {
              ref.read(checkoutProvider.notifier).setPhone(value);
              ref.read(checkoutProvider.notifier).setError(null);
            },
          ),
          if (checkout.error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              checkout.error!,
              style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
            ),
          ],
          const SizedBox(height: AppSpacing.xxl),
          CheckoutDualActions(
            onSecondary: () {
              ref.read(checkoutProvider.notifier).clearAll();
              context.go(AppRoutes.cart);
            },
            onPrimary: _continue,
            primaryLabel: AppStrings.checkout,
            primaryDisabled: !phoneValid,
          ),
        ],
      ),
    );
  }
}
