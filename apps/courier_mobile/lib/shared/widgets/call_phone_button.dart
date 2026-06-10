import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import 'food_app_button.dart';

class CallPhoneButton extends StatelessWidget {
  const CallPhoneButton({super.key, required this.phone});

  final String phone;

  @override
  Widget build(BuildContext context) {
    final trimmed = phone.trim();
    if (trimmed.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
      child: FoodAppButton(
        label: AppStrings.callCustomer,
        variant: FoodAppButtonVariant.secondary,
        onPressed: () => _call(trimmed),
      ),
    );
  }

  Future<void> _call(String value) async {
    final uri = Uri(scheme: 'tel', path: value.replaceAll(' ', ''));
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
