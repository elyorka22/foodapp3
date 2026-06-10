import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../../core/utils/map_launcher.dart';
import '../models/courier_order_model.dart';
import 'food_app_button.dart';

enum CourierOrderCardMode { available, active }

class CourierOrderCard extends StatelessWidget {
  const CourierOrderCard({
    super.key,
    required this.order,
    required this.mode,
    required this.actionLabel,
    required this.onAction,
    this.isLoading = false,
    this.isActiveHighlight = false,
  });

  final CourierOrderModel order;
  final CourierOrderCardMode mode;
  final String actionLabel;
  final VoidCallback? onAction;
  final bool isLoading;
  final bool isActiveHighlight;

  bool get _hasCustomerCoords => order.customerLat != null && order.customerLng != null;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isActiveHighlight ? AppColors.primarySoft : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActiveHighlight ? AppColors.primary : AppColors.border,
          width: isActiveHighlight ? 1.5 : 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '#${order.orderNumber}',
                  style: AppTypography.subtitle.copyWith(fontSize: 18),
                ),
              ),
              if (mode == CourierOrderCardMode.active)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    AppStrings.activeDelivery,
                    style: AppTypography.caption.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          _InfoLine(icon: Icons.store_outlined, label: order.restaurantName ?? '—'),
          if (order.distanceKm != null)
            _InfoLine(
              icon: Icons.route_outlined,
              label: '${order.distanceKm} km',
            ),
          _InfoLine(
            icon: Icons.payments_outlined,
            label: formatSum(order.courierFee ?? order.deliveryFee),
            valueColor: AppColors.primary,
          ),
          if (order.customerPhone != null && order.customerPhone!.trim().isNotEmpty)
            InkWell(
              onTap: () => _callPhone(order.customerPhone!),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: _InfoLine(
                  icon: Icons.phone_outlined,
                  label: order.customerPhone!,
                  valueColor: AppColors.primary,
                ),
              ),
            ),
          if (order.customerAddress != null && order.customerAddress!.trim().isNotEmpty)
            _InfoLine(icon: Icons.location_on_outlined, label: order.customerAddress!),
          const SizedBox(height: AppSpacing.md),
          if (_hasCustomerCoords)
            FoodAppButton(
              label: AppStrings.openMap,
              variant: FoodAppButtonVariant.secondary,
              onPressed: () => showMapPicker(
                context,
                order.customerLat!,
                order.customerLng!,
              ),
            ),
          if (_hasCustomerCoords) const SizedBox(height: AppSpacing.sm),
          FoodAppButton(
            label: actionLabel,
            isLoading: isLoading,
            onPressed: onAction,
          ),
        ],
      ),
    );
  }

  Future<void> _callPhone(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone.replaceAll(' ', ''));
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}

class _InfoLine extends StatelessWidget {
  const _InfoLine({
    required this.icon,
    required this.label,
    this.valueColor,
  });

  final IconData icon;
  final String label;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              label,
              style: AppTypography.body.copyWith(
                color: valueColor ?? AppColors.textPrimary,
                fontWeight: valueColor != null ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
