import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import 'food_app_button.dart';

class CallPhoneButton extends StatelessWidget {
  const CallPhoneButton({
    super.key,
    required this.phone,
    this.compact = false,
  });

  final String phone;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final trimmed = phone.trim();
    if (trimmed.isEmpty) return const SizedBox.shrink();

    if (compact) {
      return IconButton.filledTonal(
        onPressed: () => _call(trimmed),
        icon: const Icon(Icons.phone_outlined, size: 20),
        tooltip: AppStrings.callCustomer,
        style: IconButton.styleFrom(
          backgroundColor: AppColors.primarySoft,
          foregroundColor: AppColors.primary,
        ),
      );
    }

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
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }
}
