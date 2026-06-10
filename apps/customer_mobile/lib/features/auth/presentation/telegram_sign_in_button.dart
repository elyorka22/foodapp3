import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import 'auth_social_button.dart';

class TelegramSignInButton extends StatelessWidget {
  const TelegramSignInButton({
    super.key,
    required this.onPressed,
  });

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return AuthSocialButton(
      label: AppStrings.telegramLogin,
      onPressed: onPressed,
      leading: const TelegramBrandIcon(),
    );
  }
}
