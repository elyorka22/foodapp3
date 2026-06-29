import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../core/theme/app_typography.dart';

/// Promotions hub — opened from PROMOTION push deep link.
class PromotionsScreen extends StatelessWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.promotionsTitle, style: AppTypography.title),
      ),
      body: Padding(
        padding: scrollSafePadding(
          context,
          base: const EdgeInsets.all(AppSpacing.lg),
          extra: 0,
        ),
        child: Text(
          AppStrings.promotionsHint,
          style: AppTypography.body,
        ),
      ),
    );
  }
}
