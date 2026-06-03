import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

enum FoodAppButtonVariant { primary, secondary, ghost, danger }

class FoodAppButton extends StatelessWidget {
  const FoodAppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = FoodAppButtonVariant.primary,
    this.isLoading = false,
    this.expanded = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final FoodAppButtonVariant variant;
  final bool isLoading;
  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            height: 22,
            width: 22,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Text(label, style: AppTypography.button);

    final button = Material(
      color: _background,
      borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
      elevation: 0,
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
            border: variant == FoodAppButtonVariant.secondary
                ? Border.all(color: AppColors.border)
                : null,
            boxShadow: variant == FoodAppButtonVariant.primary ? AppShadows.button : null,
          ),
          alignment: Alignment.center,
          child: DefaultTextStyle(
            style: AppTypography.button.copyWith(color: _foreground),
            child: child,
          ),
        ),
      ),
    );

    if (!expanded) return button;
    return SizedBox(width: double.infinity, child: button);
  }

  Color get _background {
    switch (variant) {
      case FoodAppButtonVariant.primary:
        return AppColors.primary;
      case FoodAppButtonVariant.secondary:
        return AppColors.surface;
      case FoodAppButtonVariant.ghost:
        return Colors.transparent;
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
      case FoodAppButtonVariant.ghost:
        return AppColors.primary;
    }
  }
}
