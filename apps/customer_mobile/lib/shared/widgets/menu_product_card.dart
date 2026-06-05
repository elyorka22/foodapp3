import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../../core/utils/image_url.dart';
import '../../shared/models/restaurant_model.dart';

final _weightPattern = RegExp(
  r'(\d+(?:[.,]\d+)?)\s*(?:g|г|kg|кг|ml|мл|l|л)\b',
  caseSensitive: false,
);

String? parseProductWeight(String? description) {
  if (description == null || description.isEmpty) return null;
  final match = _weightPattern.firstMatch(description);
  return match?.group(0)?.replaceAll(',', '.');
}

class MenuProductCard extends StatelessWidget {
  const MenuProductCard({
    super.key,
    required this.product,
    required this.quantity,
    required this.disabled,
    required this.onAdd,
    required this.onRemove,
  });

  final ProductModel product;
  final int quantity;
  final bool disabled;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final price = product.price.toDouble();
    final compare = product.comparePrice?.toDouble();
    final hasDiscount = compare != null && compare > price;
    final discountAmount = hasDiscount ? compare - price : null;
    final description = product.description?.trim();
    final weight = parseProductWeight(description);
    final imageUrl = resolveImageUrl(product.imageUrl);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AspectRatio(
          aspectRatio: 1,
          child: Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: imageUrl != null
                    ? CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.cover)
                    : ColoredBox(
                        color: AppColors.border,
                        child: Center(
                          child: Text(
                            '🍽',
                            style: AppTypography.display.copyWith(fontSize: 32),
                          ),
                        ),
                      ),
              ),
              if (discountAmount != null && discountAmount > 0)
                Positioned(
                  left: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '−${formatSum(discountAmount)}',
                      style: AppTypography.caption.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
              Positioned(
                right: 8,
                bottom: 8,
                child: quantity == 0
                    ? _AddButton(disabled: disabled, onTap: onAdd)
                    : _QtyControls(
                        quantity: quantity,
                        disabled: disabled,
                        onAdd: onAdd,
                        onRemove: onRemove,
                      ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          formatSum(product.price),
          style: AppTypography.subtitle.copyWith(
            color: AppColors.primary,
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
        if (hasDiscount)
          Text(
            formatSum(compare),
            style: AppTypography.bodySmall.copyWith(
              decoration: TextDecoration.lineThrough,
              color: AppColors.textMuted,
            ),
          ),
        const SizedBox(height: 4),
        Text(
          product.name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
        if (description != null && description.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
            ),
          )
        else if (weight != null)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(weight, style: AppTypography.caption),
          ),
      ],
    );
  }
}

class _AddButton extends StatelessWidget {
  const _AddButton({required this.disabled, required this.onTap});

  final bool disabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 2,
      shadowColor: Colors.black26,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: disabled ? null : onTap,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(
            Icons.add,
            color: disabled ? AppColors.textMuted : AppColors.textPrimary,
            size: 24,
          ),
        ),
      ),
    );
  }
}

class _QtyControls extends StatelessWidget {
  const _QtyControls({
    required this.quantity,
    required this.disabled,
    required this.onAdd,
    required this.onRemove,
  });

  final int quantity;
  final bool disabled;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 2,
      shadowColor: Colors.black26,
      borderRadius: BorderRadius.circular(24),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: disabled ? null : onRemove,
            icon: const Icon(Icons.remove, size: 20),
          ),
          Text('$quantity', style: AppTypography.subtitle.copyWith(fontSize: 14)),
          IconButton(
            visualDensity: VisualDensity.compact,
            onPressed: disabled ? null : onAdd,
            icon: const Icon(Icons.add, size: 20),
          ),
        ],
      ),
    );
  }
}
