import 'package:flutter/material.dart';
import '../../core/jobs/courier_job_adapter.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'food_app_button.dart';

class JobOfferCard extends StatelessWidget {
  const JobOfferCard({
    super.key,
    required this.order,
    required this.onAccept,
    this.onOpen,
    this.isLoading = false,
  });

  final CourierOrderModel order;
  final VoidCallback? onAccept;
  final VoidCallback? onOpen;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final pickup = order.stops.isNotEmpty ? order.stops.first : null;
    final dropoff = order.stops.length > 1 ? order.stops.last : null;
    final merchant = order.merchantTypeLabel.isNotEmpty
        ? order.merchantTypeLabel
        : AppStrings.merchantRestaurant;
    final itemCount = order.items.isEmpty ? null : order.items.length;
    final fee = order.estimatedCourierFee ?? order.courierEarnings;

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(28),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(28),
        child: Container(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppColors.border),
            boxShadow: const [
              BoxShadow(
                color: Color(0x14000000),
                blurRadius: 16,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Text(
                    AppStrings.newOrderTitle,
                    style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const Spacer(),
                  Text(
                    itemCount == null
                        ? merchant
                        : '$merchant · $itemCount ta pozitsiya',
                    style: AppTypography.caption,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                formatSum(fee),
                style: AppTypography.display.copyWith(fontSize: 34, color: AppColors.accent),
              ),
              if (order.distanceKm != null) ...[
                const SizedBox(height: 4),
                Text(
                  'Jami ${order.distanceKm!.toStringAsFixed(1)} km',
                  style: AppTypography.bodySmall,
                ),
              ],
              const SizedBox(height: 16),
              _RouteStop(
                icon: Icons.storefront_outlined,
                title: pickup?.title ?? order.restaurantName ?? '—',
                subtitle: pickup?.subtitle ?? '',
              ),
              Padding(
                padding: const EdgeInsets.only(left: 19),
                child: Container(
                  width: 2,
                  height: 14,
                  color: AppColors.borderLight,
                ),
              ),
              _RouteStop(
                icon: Icons.location_on_outlined,
                title: AppStrings.customerAddressLabel,
                subtitle: dropoff?.subtitle ?? order.customerAddress ?? '—',
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _Chip(
                    label: '$merchant',
                    filled: false,
                  ),
                  const SizedBox(width: 8),
                  _Chip(
                    label: '${AppStrings.cashPayment} · ${formatSum(order.collectFromCustomer)}',
                    filled: true,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              FoodAppButton(
                label: AppStrings.acceptOrder,
                isLoading: isLoading,
                onPressed: onAccept,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RouteStop extends StatelessWidget {
  const _RouteStop({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.surfaceHighlight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 18, color: AppColors.textPrimary),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.subtitle.copyWith(fontSize: 15),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (subtitle.trim().isNotEmpty)
                Text(
                  subtitle,
                  style: AppTypography.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.filled});

  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: filled ? AppColors.cashSoft : AppColors.surfaceHighlight,
        borderRadius: BorderRadius.circular(12),
        border: filled
            ? Border.all(color: const Color(0x73D68C00), width: 1.5)
            : null,
      ),
      child: Text(
        label,
        style: AppTypography.caption.copyWith(
          color: filled ? AppColors.warning : AppColors.textSecondary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
