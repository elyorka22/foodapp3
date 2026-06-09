import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../shared/widgets/food_app_button.dart';

class TelegramSignInButton extends StatelessWidget {
  const TelegramSignInButton({
    super.key,
    required this.onPressed,
  });

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return FoodAppButton(
      label: AppStrings.telegramLogin,
      variant: FoodAppButtonVariant.secondary,
      onPressed: onPressed,
    );
  }
}
