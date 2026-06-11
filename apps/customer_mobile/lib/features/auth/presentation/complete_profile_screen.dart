import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/widgets/uz_phone_field.dart';
import '../providers/auth_provider.dart';

/// Shown when Telegram (or other) auth returns `needsPhone: true`.
class CompleteProfileScreen extends ConsumerStatefulWidget {
  const CompleteProfileScreen({super.key});

  @override
  ConsumerState<CompleteProfileScreen> createState() => _CompleteProfileScreenState();
}

class _CompleteProfileScreenState extends ConsumerState<CompleteProfileScreen> {
  final _phone = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.completeProfile, style: AppTypography.title)),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (user != null) ...[
              Text(user.fullName, style: AppTypography.title),
              const SizedBox(height: AppSpacing.sm),
            ],
            Text(AppStrings.completeProfileHint, style: AppTypography.bodySmall),
            const SizedBox(height: AppSpacing.xxl),
            UzPhoneField(
              label: AppStrings.phone,
              controller: _phone,
              hint: AppStrings.phonePlaceholder,
            ),
            const SizedBox(height: AppSpacing.xxl),
            FoodAppButton(
              label: AppStrings.save,
              isLoading: _loading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!isValidUzPhone(_phone.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Telefon raqamini to\'liq kiriting (+998 dan keyin 9 raqam)')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await ref.read(authStateProvider.notifier).completeProfile(normalizePhone(_phone.text));
      if (!mounted) return;
      context.go(AppRoutes.restaurants);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}
