import 'package:flutter/material.dart';
import 'app_colors.dart';

abstract final class AppShadows {
  static List<BoxShadow> get card => AppColors.cardShadow;

  static List<BoxShadow> get button => [
        BoxShadow(
          color: AppColors.primary.withValues(alpha: 0.28),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ];
}
