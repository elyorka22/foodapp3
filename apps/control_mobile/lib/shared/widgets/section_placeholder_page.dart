import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'placeholder_banner.dart';

class SectionPlaceholderPage extends StatelessWidget {
  const SectionPlaceholderPage({
    super.key,
    required this.title,
    this.description = AppStrings.sectionPlaceholder,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      children: [
        Text(title, style: AppTypography.display),
        const SizedBox(height: 8),
        Text(AppStrings.comingSoon, style: AppTypography.bodySmall),
        const SizedBox(height: 20),
        PlaceholderBanner(message: description),
      ],
    );
  }
}
