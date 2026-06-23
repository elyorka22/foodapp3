import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'customer_page.dart';
import 'food_app_button.dart';

class CheckoutPromoCard extends StatefulWidget {
  const CheckoutPromoCard({
    super.key,
    required this.controller,
    required this.onApply,
    required this.validating,
    required this.message,
    this.initialOpen = false,
  });

  final TextEditingController controller;
  final VoidCallback? onApply;
  final bool validating;
  final String message;
  final bool initialOpen;

  @override
  State<CheckoutPromoCard> createState() => _CheckoutPromoCardState();
}

class _CheckoutPromoCardState extends State<CheckoutPromoCard> {
  late bool _open;

  @override
  void initState() {
    super.initState();
    _open = widget.initialOpen;
  }

  @override
  Widget build(BuildContext context) {
    return CustomerCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () => setState(() => _open = !_open),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      AppStrings.checkoutPromoLabel,
                      style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                  Icon(
                    _open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: AppColors.textMuted,
                  ),
                ],
              ),
            ),
          ),
          if (_open) ...[
            const Divider(height: 1, color: Color(0xFFF4F4F5)),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: CustomerTextField(
                          controller: widget.controller,
                          placeholder: AppStrings.promoCode,
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      SizedBox(
                        width: 108,
                        child: FoodAppButton(
                          label: widget.validating ? '...' : AppStrings.apply,
                          variant: FoodAppButtonVariant.secondary,
                          expanded: true,
                          onPressed: widget.onApply,
                        ),
                      ),
                    ],
                  ),
                  if (widget.message.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      widget.message,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.primary),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
