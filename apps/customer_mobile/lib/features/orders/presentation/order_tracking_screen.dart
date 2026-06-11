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
  });

  final OrderTrackModel order;
  final bool isStale;

  @override
  Widget build(BuildContext context) {
    final progressIdx = OrderStatusSteps.activeIndex(order.status);
    final isCancelled = order.status == 'CANCELLED';
    final statusHint = OrderStatusSteps.statusHint(order.status);

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
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (statusHint != null) ...[
                      Text(
                        statusHint,
                        style: AppTypography.subtitle.copyWith(color: AppColors.primary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                    ],
                    _SimpleProgressBar(progressIndex: progressIdx),
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

class _SimpleProgressBar extends StatelessWidget {
  const _SimpleProgressBar({required this.progressIndex});

  final int progressIndex;

  @override
  Widget build(BuildContext context) {
    final steps = OrderStatusSteps.steps;

    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          if (i > 0) Expanded(child: _ConnectorLine(filled: i <= progressIndex)),
          _StageNode(
            step: steps[i],
            state: i < progressIndex
                ? _StageState.done
                : i == progressIndex
                    ? _StageState.active
                    : _StageState.pending,
          ),
        ],
      ],
    );
  }
}

enum _StageState { done, active, pending }

class _StageNode extends StatelessWidget {
  const _StageNode({required this.step, required this.state});

  final OrderStep step;
  final _StageState state;

  IconData get _icon => switch (step.iconName) {
        'store' => Icons.storefront_outlined,
        'delivery' => Icons.delivery_dining_outlined,
        _ => Icons.home_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final color = switch (state) {
      _StageState.done => AppColors.success,
      _StageState.active => AppColors.primary,
      _StageState.pending => AppColors.textMuted,
    };

    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: state == _StageState.pending
                  ? AppColors.border.withValues(alpha: 0.5)
                  : color.withValues(alpha: 0.12),
              border: Border.all(color: color, width: 2),
            ),
            child: Icon(
              state == _StageState.done ? Icons.check : _icon,
              color: color,
              size: 22,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            step.label,
            style: AppTypography.caption.copyWith(
              color: state == _StageState.pending ? AppColors.textMuted : AppColors.textPrimary,
              fontWeight: state == _StageState.active ? FontWeight.w700 : FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
          ),
        ],
      ),
    );
  }
}

class _ConnectorLine extends StatelessWidget {
  const _ConnectorLine({required this.filled});

  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 3,
      margin: const EdgeInsets.only(bottom: 28),
      decoration: BoxDecoration(
        color: filled ? AppColors.primary : AppColors.border,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}
