import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class HomeSectionHeader extends StatelessWidget {
  const HomeSectionHeader({
    super.key,
    required this.title,
    this.linkLabel,
    this.count,
    this.onSeeAll,
  });

  final String title;
  final String? linkLabel;
  final int? count;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    final link = linkLabel ?? AppStrings.seeAll;
    final suffix = count != null && count! > 0 ? ' $count' : '';

    return Row(
      children: [
        Expanded(
          child: Text(title, style: AppTypography.sectionTitle),
        ),
        if (onSeeAll != null)
          GestureDetector(
            onTap: onSeeAll,
            behavior: HitTestBehavior.opaque,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '$link$suffix',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                  color: AppColors.textMuted,
                ),
              ],
            ),
          ),
      ],
    );
  }
}
