import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'customer_page.dart';

/// Delivery info on checkout (main action is the bottom bar button).
class DeliveryLocationField extends StatelessWidget {
  const DeliveryLocationField({
    super.key,
    required this.quoted,
    required this.busy,
    this.onRecalculate,
  });

  final bool quoted;
  final bool busy;
  final VoidCallback? onRecalculate;

  @override
  Widget build(BuildContext context) {
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
          if (quoted && onRecalculate != null) ...[
            const SizedBox(height: AppSpacing.md),
            TextButton(
              onPressed: busy ? null : onRecalculate,
              child: Text(
                busy ? AppStrings.deliveryCalculating : AppStrings.recalculateDeliveryPrice,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
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
