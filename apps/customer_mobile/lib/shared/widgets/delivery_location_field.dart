import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'customer_page.dart';
import 'food_app_button.dart';

/// GPS button to calculate delivery fee (no manual address field on checkout).
class DeliveryLocationField extends StatelessWidget {
  const DeliveryLocationField({
    super.key,
    required this.quoted,
    required this.busy,
    required this.onCalculate,
  });

  final bool quoted;
  final bool busy;
  final VoidCallback? onCalculate;

  @override
  Widget build(BuildContext context) {
    final label = busy
        ? AppStrings.deliveryCalculating
        : quoted
            ? AppStrings.recalculateDeliveryPrice
            : AppStrings.calculateDeliveryPrice;

    return CustomerCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            AppStrings.deliveryLabel,
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            AppStrings.deliveryPriceHint,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: AppSpacing.md),
          FoodAppButton(
            label: label,
            variant: quoted ? FoodAppButtonVariant.secondary : FoodAppButtonVariant.primary,
            isLoading: busy,
            onPressed: busy ? null : onCalculate,
          ),
        ],
      ),
    );
  }
}

String? validateDeliveryLocation({
  required double? lat,
  required double? lng,
}) {
  if (lat == null || lng == null) return AppStrings.deliveryPriceRequired;
  return null;
}
