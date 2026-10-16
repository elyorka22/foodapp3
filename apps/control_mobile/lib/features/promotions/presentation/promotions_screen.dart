import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../shared/widgets/section_placeholder_page.dart';

class PromotionsScreen extends StatelessWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPlaceholderPage(title: AppStrings.promotionsTitle);
  }
}
