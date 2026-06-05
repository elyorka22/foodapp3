import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'customer_page.dart';

/// Optional address + single button to calculate delivery from GPS.
class DeliveryLocationField extends StatelessWidget {
  const DeliveryLocationField({
    super.key,
    required this.addressController,
    required this.quoted,
    required this.busy,
    required this.onCalculate,
  });

  final TextEditingController addressController;
  final bool quoted;
  final bool busy;
  final VoidCallback? onCalculate;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppStrings.deliveryLabel, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(
            AppStrings.deliveryPriceHint,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: AppSpacing.md),
          CustomerTextField(
            controller: addressController,
            placeholder: AppStrings.deliveryAddressOptional,
            maxLines: 2,
          ),
          const SizedBox(height: AppSpacing.md),
          Material(
            color: quoted ? const Color(0xFFF0FDF4) : AppColors.primarySoft,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: busy ? null : onCalculate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: quoted
                        ? const Color(0xFFBBF7D0)
                        : AppColors.primary.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: quoted ? AppColors.success : AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      busy
                          ? AppStrings.deliveryCalculating
                          : quoted
                              ? AppStrings.recalculateDeliveryPrice
                              : AppStrings.calculateDeliveryPrice,
                      style: AppTypography.bodySmall.copyWith(
                        fontWeight: FontWeight.w600,
                        color: quoted
                            ? const Color(0xFF166534)
                            : AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
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
