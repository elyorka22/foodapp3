import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';

/// Shows what the courier pays at the merchant, collects from customer, and earns.
class OrderMoneySummary extends StatelessWidget {
  const OrderMoneySummary({
    super.key,
    required this.order,
    this.compact = false,
    this.showCollectTotal = false,
  });

  final CourierOrderModel order;
  final bool compact;
  final bool showCollectTotal;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          _CompactMoneyLine(
            label: AppStrings.payAtRestaurantShort,
            value: order.orderAmount,
          ),
          const SizedBox(height: 2),
          _CompactMoneyLine(
            label: AppStrings.collectFromCustomerShort,
            value: order.collectFromCustomer,
            emphasized: true,
          ),
          const SizedBox(height: 2),
          _CompactMoneyLine(
            label: AppStrings.courierIncomeShort,
            value: order.courierEarnings,
            valueColor: AppColors.primary,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _MoneyRow(
          label: AppStrings.payAtRestaurant,
          value: order.orderAmount,
        ),
        const SizedBox(height: 6),
        _MoneyRow(
          label: AppStrings.customerDeliveryFee,
          value: order.customerDeliveryFee,
        ),
        const SizedBox(height: 6),
        _MoneyRow(
          label: AppStrings.deliveryEarnings,
          value: order.courierEarnings,
          valueColor: AppColors.primary,
        ),
        if (showCollectTotal) ...[
          const SizedBox(height: 6),
          _MoneyRow(
            label: AppStrings.collectFromCustomer,
            value: order.collectFromCustomer,
            emphasized: true,
          ),
        ],
      ],
    );
  }
}

class _CompactMoneyLine extends StatelessWidget {
  const _CompactMoneyLine({
    required this.label,
    required this.value,
    this.emphasized = false,
    this.valueColor,
  });

  final String label;
  final num value;
  final bool emphasized;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final valueStyle = emphasized
        ? AppTypography.body.copyWith(fontWeight: FontWeight.w800)
        : AppTypography.caption.copyWith(
            fontWeight: FontWeight.w700,
            color: valueColor ?? AppColors.textPrimary,
          );

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('$label: ', style: AppTypography.caption),
        Text(formatSum(value), style: valueStyle),
      ],
    );
  }
}

class _MoneyRow extends StatelessWidget {
  const _MoneyRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.emphasized = false,
  });

  final String label;
  final num value;
  final Color? valueColor;
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    final valueStyle = emphasized
        ? AppTypography.subtitle.copyWith(
            color: valueColor ?? AppColors.textPrimary,
            fontWeight: FontWeight.w800,
          )
        : AppTypography.body.copyWith(
            color: valueColor,
            fontWeight: valueColor != null ? FontWeight.w700 : FontWeight.w600,
          );

    return Row(
      children: [
        Expanded(child: Text(label, style: AppTypography.bodySmall)),
        Text(formatSum(value), style: valueStyle),
      ],
    );
  }
}
