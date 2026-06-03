import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
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
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Text(
          AppStrings.promotionsHint,
          style: AppTypography.body,
        ),
      ),
    );
  }
}
