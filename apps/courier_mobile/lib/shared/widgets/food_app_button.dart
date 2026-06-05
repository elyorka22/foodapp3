import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

enum FoodAppButtonVariant { primary, secondary, danger }

class FoodAppButton extends StatelessWidget {
  const FoodAppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = FoodAppButtonVariant.primary,
    this.isLoading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final FoodAppButtonVariant variant;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !isLoading;
    return SizedBox(
      width: double.infinity,
      child: Opacity(
        opacity: enabled ? 1 : 0.5,
        child: Material(
          color: _background,
          borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          child: InkWell(
            onTap: enabled ? onPressed : null,
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
            child: Container(
              constraints: const BoxConstraints(minHeight: 52),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
                border: variant == FoodAppButtonVariant.secondary
                    ? Border.all(color: AppColors.border)
                    : null,
                boxShadow: variant == FoodAppButtonVariant.primary ? AppShadows.button : null,
              ),
              alignment: Alignment.center,
              child: isLoading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(label, style: AppTypography.button.copyWith(color: _foreground)),
            ),
          ),
        ),
      ),
    );
  }

  Color get _background {
    switch (variant) {
      case FoodAppButtonVariant.primary:
        return AppColors.primary;
      case FoodAppButtonVariant.secondary:
        return AppColors.surface;
      case FoodAppButtonVariant.danger:
        return AppColors.danger;
    }
  }

  Color get _foreground {
    switch (variant) {
      case FoodAppButtonVariant.primary:
      case FoodAppButtonVariant.danger:
        return Colors.white;
      case FoodAppButtonVariant.secondary:
        return AppColors.textPrimary;
    }
  }
}
