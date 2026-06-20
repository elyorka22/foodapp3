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

  @override
  Widget build(BuildContext context) {
    final description = item.description?.trim();
    final nameStyle = baseStyle ?? AppTypography.subtitle;

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
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${item.quantity}',
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
        ),
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
                  style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
