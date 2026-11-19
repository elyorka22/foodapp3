import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// Pyaterochka-style white island on gray page background.
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

  static const double radius = 28;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
      child: child,
    );

    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 2,
            offset: Offset(0, 1),
          ),
        ],
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
