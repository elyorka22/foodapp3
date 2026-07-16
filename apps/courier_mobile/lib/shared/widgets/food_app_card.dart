import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

class FoodAppCard extends StatelessWidget {
  const FoodAppCard({
    super.key,
    required this.child,
    this.padding,
    this.elevated = false,
    this.bordered = true,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final bool elevated;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: elevated ? AppColors.surfaceElevated : AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: bordered ? Border.all(color: AppColors.border) : null,
      ),
      child: child,
    );
  }
}
