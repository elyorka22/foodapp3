import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_typography.dart';

/// Two-step confirmation before cancelling an order.
Future<bool> confirmOrderCancellation(BuildContext context) async {
  final step1 = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(AppStrings.cancelOrderConfirmTitle, style: AppTypography.subtitle),
      content: Text(AppStrings.cancelOrderConfirmBody, style: AppTypography.body),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text(AppStrings.back),
        ),
        TextButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(
            AppStrings.cancelOrder,
            style: AppTypography.body.copyWith(color: Colors.red),
          ),
        ),
      ],
    ),
  );
  if (step1 != true || !context.mounted) return false;

  final step2 = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(AppStrings.cancelOrderFinalTitle, style: AppTypography.subtitle),
      content: Text(AppStrings.cancelOrderFinalBody, style: AppTypography.body),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text(AppStrings.back),
        ),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: Colors.red),
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text(AppStrings.confirm),
        ),
      ],
    ),
  );

  return step2 == true;
}
