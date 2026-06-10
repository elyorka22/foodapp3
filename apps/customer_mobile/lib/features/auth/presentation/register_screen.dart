import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../data/google_auth_service.dart';
import '../providers/auth_provider.dart';
import 'auth_social_layout.dart';
import 'google_sign_in_button.dart';
import 'telegram_sign_in_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  bool _googleLoading = false;

  bool get _busy => _googleLoading;

  Future<void> _submitGoogle() async {
    setState(() => _googleLoading = true);
    try {
      await ref.read(authStateProvider.notifier).loginGoogle();
      if (mounted) context.pop();
    } on GoogleAuthCancelledException {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.googleSignInCancelled)),
        );
      }
    } on GoogleAuthConfigException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.googleSignInFailed;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.googleSignInFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  bool get _telegramEnabled => AppConfig.telegramBotUsername.trim().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final actions = <Widget>[
      GoogleSignInButton(
        isLoading: _googleLoading,
        onPressed: _busy ? null : _submitGoogle,
      ),
      if (_telegramEnabled)
        TelegramSignInButton(
          onPressed: _busy ? null : () => context.push('/profile/telegram'),
        ),
    ];

    return AuthSocialLayout(
      title: AppStrings.register,
      subtitle: AppStrings.registerSocialSubtitle,
      actions: actions,
      footer: TextButton(
        onPressed: () => context.pushReplacement('/profile/login'),
        child: Text(
          AppStrings.haveAccountLogin,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
