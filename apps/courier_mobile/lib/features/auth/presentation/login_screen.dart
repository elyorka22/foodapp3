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
import '../../../shared/widgets/app_atmosphere.dart';
import '../../../shared/widgets/brand_mark.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  late final AnimationController _controller;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppAtmosphere(
        intense: true,
        child: SafeArea(
          child: FadeTransition(
            opacity: _fade,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Spacer(flex: 2),
                  const Center(child: BrandMark(size: 84)),
                  const SizedBox(height: AppSpacing.xl),
                  Text(
                    AppStrings.appName,
                    textAlign: TextAlign.center,
                    style: AppTypography.display.copyWith(fontSize: 32),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    AppStrings.appTagline,
                    textAlign: TextAlign.center,
                    style: AppTypography.bodySmall,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: JobServiceType.values.map((t) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Column(
                          children: [
                            Icon(
                              t.icon,
                              color: t.isAvailable ? t.color : AppColors.textMuted,
                              size: 20,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              t.label,
                              style: AppTypography.caption.copyWith(
                                color: t.isAvailable
                                    ? AppColors.textSecondary
                                    : AppColors.textMuted,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
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
                  FoodAppButton(
                    label: AppStrings.login,
                    isLoading: _loading,
                    onPressed: _submit,
                  ),
                  const Spacer(flex: 3),
                ],
              ),
            ),
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
        action: SnackBarAction(label: 'OK', onPressed: () {}),
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
