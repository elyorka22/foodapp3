import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';

class NewOrderIncomingCard extends StatelessWidget {
  const NewOrderIncomingCard({
    super.key,
    required this.order,
    required this.onAccept,
    this.onReject,
    this.onDetails,
    this.restaurantName,
    this.isLoading = false,
    this.useRestaurantAccent = true,
  });

  final StaffOrderModel order;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;
  final VoidCallback? onDetails;
  final String? restaurantName;
  final bool isLoading;
  final bool useRestaurantAccent;

  Color get _accent =>
      useRestaurantAccent ? AppColors.restaurant : AppColors.primary;

  @override
  Widget build(BuildContext context) {
    final preview = order.items.isEmpty
        ? (restaurantName ?? order.restaurantName ?? '')
        : order.items
            .take(3)
            .map((e) => e.name)
            .join(', ');
    final ago = _agoText(order.createdAt);
    final qty = order.items.fold<int>(0, (s, i) => s + i.quantity);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: useRestaurantAccent
              ? AppColors.borderRestaurant
              : AppColors.borderLight,
        ),
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
                  color: AppColors.textRestaurant,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: useRestaurantAccent
                      ? const Color(0xFFF1ECE6)
                      : AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  useRestaurantAccent ? 'Yetkazish' : 'Kuryer',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: useRestaurantAccent
                        ? const Color(0xFF4A423B)
                        : AppColors.primaryDark,
                  ),
                ),
              ),
              const Spacer(),
              if (ago != null)
                Text(
                  ago,
                  style: TextStyle(
                    fontSize: 13,
                    color: useRestaurantAccent
                        ? AppColors.textSecondaryRestaurant
                        : AppColors.textSecondary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (useRestaurantAccent && order.items.isNotEmpty)
            ...order.items.take(4).map(
                  (line) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          constraints: const BoxConstraints(minWidth: 30),
                          height: 24,
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AppColors.restaurantSoft,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${line.quantity}×',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.restaurantMuted,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            line.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textRestaurant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
          else ...[
            Text(
              '${order.customerPhone ?? 'Mijoz'} · $qty ta mahsulot',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            if (preview.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                preview,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.warningSoft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Javob bering',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.warning,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                formatSum(order.itemsTotal),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textRestaurant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    onPressed: isLoading
                        ? null
                        : (onReject ?? onDetails),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: BorderSide(
                        color: useRestaurantAccent
                            ? const Color(0xFFD9D0C6)
                            : AppColors.border,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.buttonRadius),
                      ),
                    ),
                    child: Text(
                      onReject != null
                          ? 'Rad etish'
                          : (onDetails != null
                              ? AppStrings.showDetails
                              : 'Rad etish'),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 48,
                  child: FilledButton(
                    onPressed: isLoading ? null : onAccept,
                    style: FilledButton.styleFrom(
                      backgroundColor: _accent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.buttonRadius),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            AppStrings.acceptOrder,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static String? _agoText(DateTime? createdAt) {
    if (createdAt == null) return null;
    final mins = DateTime.now().difference(createdAt).inMinutes;
    if (mins < 1) return 'hozir';
    if (mins < 60) return '$mins daq oldin';
    final hrs = mins ~/ 60;
    return '$hrs soat oldin';
  }
}
