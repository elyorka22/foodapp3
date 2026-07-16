import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Soft depth behind courier screens — gradient + mint glow, not flat black.
class AppAtmosphere extends StatelessWidget {
  const AppAtmosphere({
    super.key,
    required this.child,
    this.intense = false,
  });

  final Widget child;
  final bool intense;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const ColoredBox(color: AppColors.background),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary.withValues(alpha: intense ? 0.14 : 0.07),
                Colors.transparent,
                AppColors.accent.withValues(alpha: intense ? 0.06 : 0.03),
              ],
              stops: const [0.0, 0.45, 1.0],
            ),
          ),
        ),
        Positioned(
          top: -80,
          right: -40,
          child: IgnorePointer(
            child: Container(
              width: intense ? 220 : 160,
              height: intense ? 220 : 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary.withValues(alpha: intense ? 0.12 : 0.06),
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -60,
          left: -30,
          child: IgnorePointer(
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accent.withValues(alpha: 0.05),
              ),
            ),
          ),
        ),
        child,
      ],
    );
  }
}
