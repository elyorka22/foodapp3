import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Light page backdrop for courier screens.
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
    return ColoredBox(
      color: AppColors.background,
      child: child,
    );
  }
}
