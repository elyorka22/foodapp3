import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../home/providers/courier_home_provider.dart';

class CompletedDeliverySummary {
  const CompletedDeliverySummary({
    required this.earnings,
    required this.cashCollected,
    required this.orderNumber,
  });

  final num earnings;
  final num cashCollected;
  final String orderNumber;
}

final lastCompletedDeliveryProvider =
    StateProvider<CompletedDeliverySummary?>((ref) => null);

class OrderCompleteScreen extends ConsumerWidget {
  const OrderCompleteScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summary = ref.watch(lastCompletedDeliveryProvider);
    final stats = ref.watch(shiftStatsProvider).valueOrNull;
    final earnings = summary?.earnings ?? 0;
    final cash = summary?.cashCollected ?? 0;
    final todayEarnings = stats?.todayEarnings ?? earnings;
    final todayDeliveries = stats?.todayDeliveries ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 20),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: AppColors.greenSoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, size: 48, color: AppColors.success),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                AppStrings.deliveryCompleted,
                style: AppTypography.title.copyWith(fontSize: 26, fontWeight: FontWeight.w800),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                AppStrings.deliveryCompletedHint,
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              Text(AppStrings.youEarned, style: AppTypography.caption),
              const SizedBox(height: 4),
              Text(
                '+${formatSum(earnings)}',
                style: AppTypography.display.copyWith(
                  fontSize: 36,
                  color: AppColors.accent,
                ),
              ),
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _BreakdownRow(label: AppStrings.roadFee, value: earnings),
                    const SizedBox(height: 10),
                    const _BreakdownRow(label: AppStrings.distanceBonus, value: 0),
                    const SizedBox(height: 10),
                    const _BreakdownRow(label: AppStrings.tipLabel, value: 0),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.cashSoft,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0x73D68C00), width: 1.5),
                ),
                child: Text(
                  cash > 0
                      ? "${AppStrings.cashOnHandHint} (${formatSum(cash)})"
                      : AppStrings.cashOnHandHint,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '${AppStrings.todayLabel}: ${formatSum(todayEarnings)} · $todayDeliveries ${AppStrings.unitOrders}',
                style: AppTypography.bodySmall,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              FoodAppButton(
                label: AppStrings.waitNextOrder,
                onPressed: () => context.go(AppRoutes.home),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => context.go(AppRoutes.home),
                child: Text(
                  AppStrings.backToHome,
                  style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  const _BreakdownRow({required this.label, required this.value});

  final String label;
  final num value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppTypography.bodySmall)),
        Text(
          formatSum(value),
          style: AppTypography.body.copyWith(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}
