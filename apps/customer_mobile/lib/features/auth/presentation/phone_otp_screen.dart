import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/uz_phone_field.dart';
import '../providers/auth_provider.dart';

enum _AuthStep { phone, code }

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
  final _phone = TextEditingController();
  final _code = TextEditingController();
  _AuthStep _step = _AuthStep.phone;
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final onCode = _step == _AuthStep.code;
    return PopScope(
      canPop: !onCode,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop || !onCode) return;
        setState(() {
          _step = _AuthStep.phone;
          _code.clear();
        });
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          title: Text(
            onCode ? AppStrings.registerStepOtp : widget.title,
            style: AppTypography.title,
          ),
          leading: onCode
              ? IconButton(
                  onPressed: _loading
                      ? null
                      : () => setState(() {
                            _step = _AuthStep.phone;
                            _code.clear();
                          }),
                  icon: const Icon(Icons.arrow_back_rounded),
                )
              : null,
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          children: [
            Text(
              onCode ? AppStrings.registerStepOtpHint : AppStrings.registerStepPhoneHint,
              style: AppTypography.body.copyWith(color: AppColors.textSecondary),
            ),
            if (onCode) ...[
              const SizedBox(height: 6),
              Text(
                normalizePhone(_phone.text),
                style: AppTypography.subtitle,
              ),
            ],
            const SizedBox(height: AppSpacing.xl),
            if (!onCode)
              UzPhoneField(
                controller: _phone,
                hint: AppStrings.phonePlaceholder,
              )
            else
              TextField(
                controller: _code,
                autofocus: true,
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                style: AppTypography.display.copyWith(letterSpacing: 12),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(4),
                ],
                decoration: const InputDecoration(
                  hintText: '••••',
                  counterText: '',
                ),
              ),
            const SizedBox(height: AppSpacing.xl),
            FoodAppButton(
              label: onCode ? AppStrings.continueAction : AppStrings.sendCode,
              isLoading: _loading,
              onPressed: _loading ? null : (onCode ? _confirm : _send),
            ),
            if (onCode) ...[
              const SizedBox(height: AppSpacing.sm),
              FoodAppButton(
                label: AppStrings.resendCode,
                variant: FoodAppButtonVariant.secondary,
                onPressed: _loading ? null : _send,
              ),
            ],
            if (!onCode && widget.footer != null) widget.footer!,
          ],
        ),
      ),
    );
  }

  Future<void> _send() async {
    if (!isValidUzPhone(_phone.text)) {
      _show(AppStrings.phoneInvalid);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).requestOtp(normalizePhone(_phone.text));
      if (mounted) setState(() => _step = _AuthStep.code);
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
      final user = await ref.read(authStateProvider.notifier).verifyOtp(
            phone: normalizePhone(_phone.text),
            code: _code.text.trim(),
          );
      if (!mounted) return;
      final needsName = widget.askName &&
          user != null &&
          (user.fullName.trim().isEmpty || user.fullName.trim() == 'Mijoz');
      if (needsName) {
        await _askName();
      }
      if (mounted) context.pop();
    } on DioException catch (error) {
      _show(_message(error));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _askName() async {
    final name = TextEditingController();
    var saving = false;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setDialog) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(AppStrings.registerStepName, style: AppTypography.title),
                    const SizedBox(height: 8),
                    Text(
                      AppStrings.registerStepNameHint,
                      style: AppTypography.body.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: name,
                      autofocus: true,
                      textCapitalization: TextCapitalization.words,
                      decoration: const InputDecoration(hintText: AppStrings.fullName),
                    ),
                    const SizedBox(height: 16),
                    FoodAppButton(
                      label: AppStrings.save,
                      isLoading: saving,
                      onPressed: saving
                          ? null
                          : () async {
                              final value = name.text.trim();
                              if (value.length < 2) {
                                _show(AppStrings.nameRequired);
                                return;
                              }
                              setDialog(() => saving = true);
                              try {
                                await ref.read(authStateProvider.notifier).updateName(value);
                                if (dialogContext.mounted) Navigator.pop(dialogContext);
                              } on DioException catch (error) {
                                setDialog(() => saving = false);
                                _show(_message(error));
                              }
                            },
                    ),
                    TextButton(
                      onPressed: saving ? null : () => Navigator.pop(dialogContext),
                      child: const Text(AppStrings.skip),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
    name.dispose();
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
