import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';
import 'status_badge.dart';

class OpenOrderInProgressCard extends StatelessWidget {
  const OpenOrderInProgressCard({
    super.key,
    required this.order,
    required this.onTap,
    this.restaurantName,
    this.useRestaurantAccent = true,
    this.onReady,
  });

  final StaffOrderModel order;
  final VoidCallback onTap;
  final String? restaurantName;
  final bool useRestaurantAccent;
  final VoidCallback? onReady;

  Color get _accent =>
      useRestaurantAccent ? AppColors.restaurant : AppColors.primary;

  @override
  Widget build(BuildContext context) {
    final border = useRestaurantAccent
        ? AppColors.borderRestaurant
        : AppColors.borderLight;
    final muted = useRestaurantAccent
        ? AppColors.textSecondaryRestaurant
        : AppColors.textSecondary;

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Text(
                    '#${order.orderNumber}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  StatusBadge(status: order.status),
                  const Spacer(),
                  Text(
                    formatSum(order.itemsTotal),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              if (order.items.isNotEmpty) ...[
                const SizedBox(height: 12),
                ...order.items.take(3).map(
                      (line) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(
                          '${line.quantity}× ${line.name}',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: muted,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
              ],
              if (onReady != null) ...[
                const SizedBox(height: 12),
                SizedBox(
                  height: 48,
                  child: FilledButton(
                    onPressed: onReady,
                    style: FilledButton.styleFrom(
                      backgroundColor: _accent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      'Tayyor',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
