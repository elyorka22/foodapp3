import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xxl,
            vertical: AppSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.xxl),
              Text(
                AppStrings.appName,
                style: AppTypography.title.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                AppStrings.appTagline,
                style: AppTypography.body.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                decoration: const InputDecoration(
                  labelText: AppStrings.loginId,
                  hintText: AppStrings.loginIdHint,
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              PasswordTextField(
                controller: _password,
                labelText: AppStrings.password,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
              ),
              const SizedBox(height: AppSpacing.xxl),
              FoodAppButton(
                label: AppStrings.login,
                isLoading: _loading,
                onPressed: _submit,
              ),
              if (kDebugMode) ...[
                const SizedBox(height: AppSpacing.lg),
                Text(
                  'API: ${AppConfig.normalizedApiBaseUrl}',
                  textAlign: TextAlign.center,
                  style: AppTypography.caption,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final loginId = _phone.text.trim();
    final password = _password.text;
    if (loginId.isEmpty || password.isEmpty) {
      _showError('Telefon/email va parolni kiriting');
      return;
    }

    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).login(loginId, password);
      if (!mounted) return;
      final user = ref.read(authStateProvider).valueOrNull;
      if (user == null) {
        _showError(AppStrings.loginFailed);
        return;
      }
      context.go(user.homeRoute);
    } catch (e) {
      if (mounted) _showError(ApiException.formatError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}
