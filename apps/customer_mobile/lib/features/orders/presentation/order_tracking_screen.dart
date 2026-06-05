import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/orders/order_status_steps.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/order_track_model.dart';
import '../../../shared/widgets/food_app_button.dart' show FoodAppButton, FoodAppButtonVariant;
import '../../../shared/widgets/food_app_card.dart';
import '../providers/order_tracking_provider.dart';

class OrderTrackingScreen extends ConsumerWidget {
  const OrderTrackingScreen({super.key, required this.trackingToken});

  final String trackingToken;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(orderTrackingProvider(trackingToken));

    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.orderTracking, style: AppTypography.title),
      ),
      body: track.when(
        data: (snapshot) => _TrackingBody(
          order: snapshot.order,
          isStale: snapshot.isStale,
          pollError: snapshot.pollError,
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('$e', textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.lg),
                FoodAppButton(
                  label: AppStrings.retry,
                  onPressed: () => ref.invalidate(orderTrackingProvider(trackingToken)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TrackingBody extends StatelessWidget {
  const _TrackingBody({
    required this.order,
    this.isStale = false,
    this.pollError,
  });

  final OrderTrackModel order;
  final bool isStale;
  final String? pollError;

  @override
  Widget build(BuildContext context) {
    final activeIdx = OrderStatusSteps.activeIndex(order.status);
    final isCancelled = order.status == 'CANCELLED';

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        if (isStale)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Material(
              color: AppColors.primarySoft,
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Text(
                  AppStrings.orderTrackingStale,
                  style: AppTypography.bodySmall,
                ),
              ),
            ),
          ),
        Text(
          '${AppStrings.orderNumber}: ${order.orderNumber}',
          style: AppTypography.title,
        ),
        if (order.restaurantName != null)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(order.restaurantName!, style: AppTypography.bodySmall),
          ),
        const SizedBox(height: AppSpacing.lg),
        FoodAppCard(
          child: isCancelled
              ? Text(
                  AppStrings.orderCancelled,
                  style: AppTypography.subtitle.copyWith(color: AppColors.danger),
                )
              : Column(
                  children: [
                    for (var i = 0; i < OrderStatusSteps.steps.length; i++)
                      _StepRow(
                        step: OrderStatusSteps.steps[i],
                        state: i < activeIdx
                            ? _StepState.done
                            : i == activeIdx
                                ? _StepState.active
                                : _StepState.pending,
                      ),
                  ],
                ),
        ),
        const SizedBox(height: AppSpacing.lg),
        if (order.courierName != null || order.deliveryFee != null || order.distanceKm != null)
          FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (order.courierName != null) ...[
                  Text(AppStrings.assignedCourier, style: AppTypography.bodySmall),
                  Text(order.courierName!, style: AppTypography.subtitle),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (order.courierPhone != null) ...[
                  Text(AppStrings.courierPhone, style: AppTypography.bodySmall),
                  Text(order.courierPhone!, style: AppTypography.body),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (order.deliveryFee != null)
                  Text(
                    '${AppStrings.deliveryFee}: ${order.deliveryFee} UZS',
                    style: AppTypography.body,
                  ),
                if (order.distanceKm != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      AppStrings.distanceKm(order.distanceKm!),
                      style: AppTypography.bodySmall,
                    ),
                  ),
              ],
            ),
          ),
        if (order.courierName != null || order.deliveryFee != null || order.distanceKm != null)
          const SizedBox(height: AppSpacing.lg),
        FoodAppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppStrings.total, style: AppTypography.subtitle),
              Text(
                '${order.total} UZS',
                style: AppTypography.title.copyWith(color: AppColors.primary),
              ),
              if (!OrderStatusSteps.isTerminal(order.status))
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(AppStrings.liveUpdatesHint, style: AppTypography.caption),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),
        FoodAppButton(
          label: AppStrings.backToRestaurants,
          variant: FoodAppButtonVariant.secondary,
          onPressed: () => context.go('/restaurants'),
        ),
      ],
    );
  }
}

enum _StepState { done, active, pending }

class _StepRow extends StatelessWidget {
  const _StepRow({required this.step, required this.state});

  final OrderStep step;
  final _StepState state;

  @override
  Widget build(BuildContext context) {
    final color = switch (state) {
      _StepState.done => AppColors.success,
      _StepState.active => AppColors.primary,
      _StepState.pending => AppColors.textMuted,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: state == _StepState.pending
                  ? AppColors.border
                  : color.withValues(alpha: 0.15),
              border: Border.all(color: color, width: 2),
            ),
            child: state == _StepState.done
                ? Icon(Icons.check, size: 16, color: color)
                : state == _StepState.active
                    ? Icon(Icons.circle, size: 10, color: color)
                    : null,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              step.label,
              style: AppTypography.body.copyWith(
                fontWeight: state == _StepState.active ? FontWeight.w600 : FontWeight.w400,
                color: state == _StepState.pending
                    ? AppColors.textMuted
                    : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
