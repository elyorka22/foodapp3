import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_typography.dart';

/// Matches web `section-header.tsx`.
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

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Text(
              title,
              style: AppTypography.sectionTitle,
            ),
          ),
          if (onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll,
              behavior: HitTestBehavior.opaque,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F4F5),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$link$suffix',
                      style: AppTypography.bodySmall.copyWith(
                        color: const Color(0xFF3F3F46),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 16,
                      color: Color(0xFF3F3F46),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
