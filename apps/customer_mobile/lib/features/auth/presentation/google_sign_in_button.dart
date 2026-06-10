import 'package:flutter/material.dart';
import '../../../core/l10n/app_strings.dart';
import 'auth_social_button.dart';

class GoogleSignInButton extends StatelessWidget {
  const GoogleSignInButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
  });

  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return AuthSocialButton(
      label: AppStrings.continueWithGoogle,
      isLoading: isLoading,
      onPressed: onPressed,
      leading: const GoogleBrandIcon(),
    );
  }
}
