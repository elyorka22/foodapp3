import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.storefront, size: 64, color: AppColors.primary),
              const SizedBox(height: AppSpacing.lg),
              Text(
                AppStrings.appName,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '${AppStrings.restaurantPanel} / ${AppStrings.managerPanel}',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.xxl),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: AppStrings.phone,
                  hintText: '+998901234567',
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              PasswordTextField(
                controller: _password,
                labelText: AppStrings.password,
              ),
              const SizedBox(height: AppSpacing.xxl),
              FoodAppButton(
                label: AppStrings.login,
                isLoading: _loading,
                onPressed: _submit,
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).login(
            _phone.text.trim(),
            _password.text,
          );
      if (!mounted) return;
      final user = ref.read(authStateProvider).valueOrNull;
      if (user == null) {
        _showError(AppStrings.loginFailed);
        return;
      }
      context.go(user.homeRoute);
    } catch (e) {
      if (mounted) {
        _showError(ApiException.formatError(e));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
