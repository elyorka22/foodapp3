import 'package:flutter/material.dart';
import '../../core/jobs/courier_job_adapter.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'service_type_badge.dart';

/// Incoming job offer — optimized for quick scanning while driving.
class JobOfferCard extends StatelessWidget {
  const JobOfferCard({
    super.key,
    required this.order,
    required this.onAccept,
    this.isLoading = false,
  });

  final CourierOrderModel order;
  final VoidCallback? onAccept;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final pickup = order.stops.first;
    final dropoff = order.stops.length > 1 ? order.stops.last : null;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onAccept,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ServiceTypeBadge(type: order.serviceType, compact: true),
                    const Spacer(),
                    Text(
                      formatSum(order.initialDeliveryFee),
                      style: AppTypography.subtitle.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _StopLine(
                  icon: Icons.circle,
                  iconColor: AppColors.serviceFood,
                  label: pickup.title,
                  sub: pickup.subtitle,
                ),
                if (dropoff != null) ...[
                  Padding(
                    padding: const EdgeInsets.only(left: 7),
                    child: Container(
                      width: 2,
                      height: 12,
                      color: AppColors.border,
                    ),
                  ),
                  _StopLine(
                    icon: Icons.location_on,
                    iconColor: AppColors.primary,
                    label: dropoff.subtitle ?? dropoff.title,
                    sub: order.distanceKm != null
                        ? '${AppStrings.distance}: ${order.distanceKm!.toStringAsFixed(1)} km'
                        : null,
                  ),
                ],
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: FilledButton(
                    onPressed: isLoading ? null : onAccept,
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.onPrimary,
                            ),
                          )
                        : Text(
                            AppStrings.accept,
                            style: AppTypography.button.copyWith(
                              color: AppColors.onPrimary,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StopLine extends StatelessWidget {
  const _StopLine({
    required this.icon,
    required this.iconColor,
    required this.label,
    this.sub,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String? sub;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: iconColor),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (sub != null && sub!.isNotEmpty)
                Text(sub!, style: AppTypography.caption, maxLines: 1),
            ],
          ),
        ),
      ],
    );
  }
}
