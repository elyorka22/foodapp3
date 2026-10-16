import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../shared/widgets/section_placeholder_page.dart';

class BusinessesScreen extends StatelessWidget {
  const BusinessesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPlaceholderPage(title: AppStrings.businessesTitle);
  }
}
