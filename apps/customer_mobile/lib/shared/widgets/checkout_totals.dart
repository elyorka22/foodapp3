import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';

class CheckoutTotals extends StatelessWidget {
  const CheckoutTotals({
    super.key,
    required this.subtotal,
    required this.promoDiscount,
    required this.deliveryFee,
    this.deliveryLoading = false,
    this.deliveryError,
  });

  final num subtotal;
  final num promoDiscount;
  final num? deliveryFee;
  final bool deliveryLoading;
  final String? deliveryError;

  @override
  Widget build(BuildContext context) {
    final netSubtotal = subtotal - promoDiscount;
    final total = deliveryFee != null ? netSubtotal + deliveryFee! : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(AppStrings.productsSubtotal, style: AppTypography.bodySmall),
            Text(formatSum(subtotal), style: AppTypography.bodySmall),
          ],
        ),
        if (promoDiscount > 0) ...[
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppStrings.promoCode,
                style: AppTypography.bodySmall.copyWith(color: AppColors.success),
              ),
              Text(
                '−${formatSum(promoDiscount)}',
                style: AppTypography.bodySmall.copyWith(color: AppColors.success),
              ),
            ],
          ),
        ],
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(AppStrings.deliveryLabel, style: AppTypography.bodySmall),
            Text(
              deliveryLoading
                  ? AppStrings.detectingLocation
                  : deliveryError != null
                      ? '—'
                      : deliveryFee != null
                          ? formatSum(deliveryFee)
                          : AppStrings.locationRequiredShort,
              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        if (deliveryError != null) ...[
          const SizedBox(height: 4),
          Text(
            deliveryError!,
            style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
          ),
        ],
        if (total != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppStrings.orderTotal, style: AppTypography.subtitle),
              Text(formatSum(total), style: AppTypography.subtitle),
            ],
          ),
        ],
      ],
    );
  }
}
