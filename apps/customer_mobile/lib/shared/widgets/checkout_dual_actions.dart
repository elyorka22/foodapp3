import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import 'food_app_button.dart';

class CheckoutDualActions extends StatelessWidget {
  const CheckoutDualActions({
    super.key,
    required this.primaryLabel,
    required this.onPrimary,
    this.onSecondary,
    this.secondaryLabel = AppStrings.clear,
    this.primaryLoading = false,
    this.primaryDisabled = false,
  });

  final String primaryLabel;
  final VoidCallback? onPrimary;
  final VoidCallback? onSecondary;
  final String secondaryLabel;
  final bool primaryLoading;
  final bool primaryDisabled;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (onSecondary != null) ...[
          Expanded(
            child: FoodAppButton(
              label: secondaryLabel,
              variant: FoodAppButtonVariant.secondary,
              onPressed: onSecondary,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
        Expanded(
          child: FoodAppButton(
            label: primaryLabel,
            isLoading: primaryLoading,
            onPressed: primaryDisabled || primaryLoading ? null : onPrimary,
          ),
        ),
      ],
    );
  }
}
