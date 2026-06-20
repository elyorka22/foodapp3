import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';

/// Dish name with optional description: `Name / Description` (description highlighted).
class OrderLineItemTitle extends StatelessWidget {
  const OrderLineItemTitle({
    super.key,
    required this.item,
    this.baseStyle,
  });

  final OrderLineItem item;
  final TextStyle? baseStyle;

  static TextStyle get defaultTitleStyle => AppTypography.body.copyWith(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        height: 1.35,
      );

  @override
  Widget build(BuildContext context) {
    final description = item.description?.trim();
    final nameStyle = baseStyle ?? defaultTitleStyle;

    if (description == null || description.isEmpty) {
      return Text(item.name, style: nameStyle);
    }

    return Text.rich(
      TextSpan(
        children: [
          TextSpan(text: item.name, style: nameStyle),
          TextSpan(
            text: ' / ',
            style: nameStyle.copyWith(color: AppColors.textSecondary),
          ),
          TextSpan(
            text: description,
            style: nameStyle.copyWith(
              color: AppColors.primaryDark,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

/// Quantity badge for order line items (`3` or compact `3x`).
class OrderLineItemQuantity extends StatelessWidget {
  const OrderLineItemQuantity({
    super.key,
    required this.quantity,
    this.compact = false,
  });

  final int quantity;
  final bool compact;

  TextStyle _quantityStyle() => AppTypography.body.copyWith(
        fontSize: compact ? 16 : 17,
        fontWeight: FontWeight.w800,
        color: AppColors.primaryDark,
        height: 1.1,
      );

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Text('${quantity}x', style: _quantityStyle());
    }

    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.accentSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.35)),
      ),
      child: Text('$quantity', style: _quantityStyle()),
    );
  }
}

class OrderItemsList extends StatelessWidget {
  const OrderItemsList({
    super.key,
    required this.items,
    this.showPrices = true,
  });

  final List<OrderLineItem> items;
  final bool showPrices;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Text(
        AppStrings.noProducts,
        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
      );
    }

    return Column(
      children: [
        for (var i = 0; i < items.length; i++) ...[
          if (i > 0) const Divider(height: 20),
          _OrderItemRow(item: items[i], showPrices: showPrices),
        ],
      ],
    );
  }
}

class _OrderItemRow extends StatelessWidget {
  const _OrderItemRow({
    required this.item,
    required this.showPrices,
  });

  final OrderLineItem item;
  final bool showPrices;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OrderLineItemQuantity(quantity: item.quantity),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              OrderLineItemTitle(item: item),
              if (showPrices) ...[
                const SizedBox(height: 4),
                Text(
                  '${formatSum(item.price)} × ${item.quantity} = ${formatSum(item.subtotal)}',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
