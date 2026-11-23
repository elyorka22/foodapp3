import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/uz_phone_field.dart';
import '../providers/auth_provider.dart';

class PhoneOtpScreen extends ConsumerStatefulWidget {
  const PhoneOtpScreen({
    super.key,
    required this.title,
    this.askName = false,
    this.footer,
  });

  final String title;
  final bool askName;
  final Widget? footer;

  @override
  ConsumerState<PhoneOtpScreen> createState() => _PhoneOtpScreenState();
}

class _PhoneOtpScreenState extends ConsumerState<PhoneOtpScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _code = TextEditingController();
  bool _codeSent = false;
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title, style: AppTypography.title)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(AppStrings.registerStepPhoneHint, style: AppTypography.bodySmall),
          const SizedBox(height: AppSpacing.lg),
          if (widget.askName) ...[
            TextField(
              controller: _name,
              enabled: !_codeSent,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(labelText: AppStrings.fullName),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          UzPhoneField(
            label: AppStrings.phone,
            controller: _phone,
            hint: AppStrings.phonePlaceholder,
          ),
          if (_codeSent) ...[
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _code,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(4),
              ],
              decoration: const InputDecoration(labelText: AppStrings.otpCode),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          FoodAppButton(
            label: _codeSent ? AppStrings.continueAction : AppStrings.sendCode,
            isLoading: _loading,
            onPressed: _loading ? null : (_codeSent ? _confirm : _send),
          ),
          if (_codeSent)
            TextButton(
              onPressed: _loading ? null : _send,
              child: const Text(AppStrings.resendCode),
            ),
          if (widget.footer != null) widget.footer!,
        ],
      ),
    );
  }

  Future<void> _send() async {
    if (widget.askName && _name.text.trim().length < 2) {
      _show(AppStrings.nameRequired);
      return;
    }
    if (!isValidUzPhone(_phone.text)) {
      _show(AppStrings.phoneInvalid);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).requestOtp(normalizePhone(_phone.text));
      if (mounted) setState(() => _codeSent = true);
    } on DioException catch (error) {
      _show(_message(error));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _confirm() async {
    if (_code.text.trim().length != 4) {
      _show(AppStrings.otpInvalid);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).verifyOtp(
            phone: normalizePhone(_phone.text),
            code: _code.text.trim(),
            fullName: widget.askName ? _name.text.trim() : null,
          );
      if (mounted) context.pop();
    } on DioException catch (error) {
      _show(_message(error));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _message(DioException error) {
    final err = error.error;
    if (err is ApiException && err.message.isNotEmpty) return err.message;
    return AppStrings.otpSendFailed;
  }

  void _show(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }
}
