import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';

class CourierAvatar extends StatelessWidget {
  const CourierAvatar({
    super.key,
    required this.name,
    this.size = 44,
  });

  final String? name;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(size * 0.32),
      ),
      child: Text(
        initialsOf(name),
        style: AppTypography.subtitle.copyWith(
          color: AppColors.onPrimary,
          fontSize: size * 0.34,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
