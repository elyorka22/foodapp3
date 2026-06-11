import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/jobs/job_service_type.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.hub, size: 40, color: AppColors.primary),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                AppStrings.appName,
                textAlign: TextAlign.center,
                style: AppTypography.title.copyWith(fontSize: 28),
              ),
              Text(
                AppStrings.appTagline,
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall,
              ),
              const SizedBox(height: AppSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: JobServiceType.values
                    .map(
                      (t) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: Icon(
                          t.icon,
                          color: t.isAvailable ? t.color : AppColors.textMuted,
                          size: 22,
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: AppSpacing.xxl),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                style: AppTypography.body,
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
              FoodAppButton(label: AppStrings.login, isLoading: _loading, onPressed: _submit),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 6),
        action: SnackBarAction(
          label: 'OK',
          onPressed: () {},
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
      if (ref.read(authStateProvider).valueOrNull == null) {
        _showError(AppStrings.loginFailed);
        return;
      }
      context.go(AppRoutes.home);
    } catch (e) {
      if (mounted) _showError(ApiException.formatError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}
