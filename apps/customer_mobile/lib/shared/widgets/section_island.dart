import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// White island flush to phone side edges. Stack with [gap] between blocks.
class SectionIsland extends StatelessWidget {
  const SectionIsland({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.clip = true,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final bool clip;

  static const double radius = 24;

  /// Minimal gray seam between islands.
  static const double gap = 6;

  /// Side inset from phone edges (matches web `mx-3`).
  static const double sideInset = 12;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
      child: child,
    );

    return Container(
      width: double.infinity,
      margin: margin ??
          const EdgeInsets.symmetric(horizontal: sideInset),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(radius),
      ),
      child: clip
          ? ClipRRect(
              borderRadius: BorderRadius.circular(radius),
              child: content,
            )
          : content,
    );
  }
}
