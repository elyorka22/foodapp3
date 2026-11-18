import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../../core/utils/image_url.dart';
import '../../shared/models/restaurant_model.dart';
import 'menu_product_card.dart';
import 'menu_product_image.dart';

/// Matches web `store-product-card.tsx` — fixed-width card for horizontal rows.
class StoreProductCard extends StatelessWidget {
  const StoreProductCard({
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
    final discountPct = hasDiscount && compare > 0
        ? (((compare - price) / compare) * 100).round()
        : null;
    final weight = parseProductWeight(product.description);
    final imageUrl = resolveImageUrl(product.imageUrl);

    return SizedBox(
      width: 140,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          AspectRatio(
            aspectRatio: 1,
            child: Stack(
              fit: StackFit.expand,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: imageUrl != null
                      ? MenuProductImage(imageUrl: imageUrl)
                      : const ColoredBox(
                          color: Color(0xFFF4F4F5),
                          child: Center(
                            child: Text('🛒', style: TextStyle(fontSize: 28)),
                          ),
                        ),
                ),
                if (discountPct != null && discountPct > 0)
                  Positioned(
                    left: 8,
                    bottom: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.textPrimary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '−$discountPct%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(
              text: formatSum(price),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                height: 1.15,
                color: AppColors.textPrimary,
              ),
              children: [
                if (product.saleUnit != null && product.saleUnit!.isNotEmpty)
                  TextSpan(
                    text: ' / ${product.saleUnit}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
          ),
          if (hasDiscount)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                formatSum(compare!),
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              product.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.25,
                color: Color(0xFF27272A),
              ),
            ),
          ),
          if (weight != null)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                weight,
                style: AppTypography.caption.copyWith(fontSize: 11),
              ),
            ),
          const SizedBox(height: 8),
          if (quantity == 0)
            SizedBox(
              height: 36,
              width: double.infinity,
              child: Material(
                color: const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(999),
                child: InkWell(
                  onTap: disabled ? null : onAdd,
                  borderRadius: BorderRadius.circular(999),
                  child: Opacity(
                    opacity: disabled ? 0.4 : 1,
                    child: const Icon(
                      Icons.add_rounded,
                      size: 22,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
            )
          else
            Container(
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Opacity(
                opacity: disabled ? 0.4 : 1,
                child: Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: disabled ? null : onRemove,
                        borderRadius: const BorderRadius.horizontal(
                          left: Radius.circular(999),
                        ),
                        child: const SizedBox(
                          height: 36,
                          child: Icon(Icons.remove_rounded, size: 20),
                        ),
                      ),
                    ),
                    Text(
                      '$quantity',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Expanded(
                      child: InkWell(
                        onTap: disabled ? null : onAdd,
                        borderRadius: const BorderRadius.horizontal(
                          right: Radius.circular(999),
                        ),
                        child: const SizedBox(
                          height: 36,
                          child: Icon(Icons.add_rounded, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
