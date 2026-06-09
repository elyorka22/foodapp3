import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_input.dart';
import '../data/google_auth_service.dart';
import '../providers/auth_provider.dart';
import 'google_sign_in_button.dart';
import 'telegram_sign_in_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _phone = TextEditingController();
  final _name = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  bool _googleLoading = false;

  @override
  void dispose() {
    _phone.dispose();
    _name.dispose();
    _password.dispose();
    super.dispose();
  }

  bool get _busy => _loading || _googleLoading;

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

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).register(
            phone: _phone.text.trim(),
            fullName: _name.text.trim(),
            password: _password.text.isEmpty ? null : _password.text,
          );
      if (mounted) context.pop();
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool get _telegramEnabled => AppConfig.telegramBotUsername.trim().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.register)),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            GoogleSignInButton(
              isLoading: _googleLoading,
              onPressed: _busy ? null : _submitGoogle,
            ),
            if (_telegramEnabled) ...[
              const SizedBox(height: AppSpacing.md),
              TelegramSignInButton(
                onPressed: _busy ? null : () => context.push('/profile/telegram'),
              ),
            ],
            const AuthOrDivider(),
            FoodAppInput(
              label: AppStrings.fullName,
              controller: _name,
              hint: AppStrings.fullName,
            ),
            const SizedBox(height: AppSpacing.md),
            FoodAppInput(
              label: AppStrings.phone,
              controller: _phone,
              keyboardType: TextInputType.phone,
              hint: AppStrings.phonePlaceholder,
            ),
            const SizedBox(height: AppSpacing.md),
            FoodAppInput(
              label: AppStrings.password,
              controller: _password,
              obscureText: true,
              hint: AppStrings.password,
            ),
            const SizedBox(height: AppSpacing.xxl),
            FoodAppButton(
              label: AppStrings.register,
              isLoading: _loading,
              onPressed: _busy ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
