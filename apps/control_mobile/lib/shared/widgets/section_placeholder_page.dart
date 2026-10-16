import 'package:flutter/material.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'placeholder_banner.dart';

/// Fallback page when a section is temporarily unavailable.
class SectionPlaceholderPage extends StatelessWidget {
  const SectionPlaceholderPage({
    super.key,
    required this.title,
    this.description = 'Bu bo‘lim vaqtincha mavjud emas.',
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.xxl),
      children: [
        Text(title, style: AppTypography.display),
        const SizedBox(height: 16),
        PlaceholderBanner(message: description),
      ],
    );
  }
}
