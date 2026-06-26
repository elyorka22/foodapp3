import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';
import 'app_card.dart';
import 'status_badge.dart';

class OpenOrderInProgressCard extends StatelessWidget {
  const OpenOrderInProgressCard({
    super.key,
    required this.order,
    required this.onTap,
    this.restaurantName,
  });

  final StaffOrderModel order;
  final VoidCallback onTap;
  final String? restaurantName;

  @override
  Widget build(BuildContext context) {
    final name = restaurantName ?? order.restaurantName;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    formatSum(order.itemsTotal),
                    style: AppTypography.title.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                  if (name != null && name.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      name,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: AppSpacing.sm),
                  StatusBadge(status: order.status),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
