import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../shared/widgets/section_placeholder_page.dart';

class EmployeesScreen extends StatelessWidget {
  const EmployeesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPlaceholderPage(title: AppStrings.employeesTitle);
  }
}
