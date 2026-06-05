import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'customer_page.dart';

/// Delivery address + GPS button — matches web `DeliveryLocation`.
class DeliveryLocationField extends StatelessWidget {
  const DeliveryLocationField({
    super.key,
    required this.addressController,
    required this.locationSent,
    required this.sending,
    required this.onSendLocation,
  });

  final TextEditingController addressController;
  final bool locationSent;
  final bool sending;
  final VoidCallback? onSendLocation;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        CustomerTextField(
          controller: addressController,
          placeholder: AppStrings.deliveryAddress,
          maxLines: 3,
        ),
        const SizedBox(height: AppSpacing.md),
        Material(
          color: locationSent ? const Color(0xFFF0FDF4) : AppColors.primarySoft,
          borderRadius: BorderRadius.circular(12),
          child: InkWell(
            onTap: sending ? null : onSendLocation,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: locationSent
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
                    color: locationSent ? AppColors.success : AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    sending
                        ? AppStrings.detectingLocation
                        : locationSent
                            ? AppStrings.locationSent
                            : AppStrings.calculateDeliveryPrice,
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: locationSent
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
    );
  }
}

String? validateDeliveryLocation({
  required String address,
  required double? lat,
  required double? lng,
}) {
  if (address.trim().isEmpty) return AppStrings.deliveryAddressRequired;
  if (lat == null || lng == null) return AppStrings.locationRequired;
  return null;
}
