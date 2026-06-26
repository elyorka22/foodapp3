import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/app_strings.dart';
import '../../../core/orders/order_status_steps.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../providers/active_order_provider.dart';
import '../providers/order_tracking_provider.dart';

class ActiveOrderBanner extends ConsumerWidget {
  const ActiveOrderBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final active = ref.watch(activeOrderProvider);
    final token = active?.token;
    if (token == null || token.isEmpty) {
      return const SizedBox.shrink();
    }

    final track = ref.watch(orderTrackingProvider(token));

    ref.listen(orderTrackingProvider(token), (previous, next) {
      next.whenData((snapshot) {
        ref
            .read(activeOrderProvider.notifier)
            .syncFromOrderStatus(snapshot.order.status);
      });
    });

    final order = track.valueOrNull?.order;
    if (order != null && OrderStatusSteps.isTerminal(order.status)) {
      return const SizedBox.shrink();
    }

    final statusLabel = order != null
        ? (OrderStatusSteps.statusHint(order.status) ?? AppStrings.orderTracking)
        : AppStrings.activeOrderTitle;
    final orderNumber = order?.orderNumber ?? active?.orderNumber;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Material(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(22),
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: () => context.push('${AppRoutes.orderTrack}/$token'),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.delivery_dining_outlined,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppStrings.activeOrderTitle,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(statusLabel, style: AppTypography.subtitle),
                      if (orderNumber != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          '${AppStrings.orderNumber}: $orderNumber',
                          style: AppTypography.bodySmall,
                        ),
                      ],
                      if (order?.restaurantName != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          order!.restaurantName!,
                          style: AppTypography.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      if (order?.total != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          formatSum(order!.total),
                          style: AppTypography.body.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.primary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
