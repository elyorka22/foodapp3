import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
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
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 480),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fade,
          child: SlideTransition(
            position: _slide,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
              children: [
                const BrandMark(size: 72, showGlow: false),
                const SizedBox(height: 20),
                Text(AppStrings.appName, style: AppTypography.display.copyWith(fontSize: 30)),
                const SizedBox(height: 8),
                Text(AppStrings.loginTitle, style: AppTypography.title.copyWith(fontSize: 20)),
                const SizedBox(height: 6),
                Text(AppStrings.loginHint, style: AppTypography.bodySmall),
                const SizedBox(height: 28),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: AppColors.border),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0F000000),
                        blurRadius: 16,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
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
                      const SizedBox(height: AppSpacing.xl),
                      FoodAppButton(
                        label: AppStrings.login,
                        isLoading: _loading,
                        onPressed: _submit,
                      ),
                    ],
                  ),
                ),
              ],
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
