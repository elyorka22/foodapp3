import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Matches web `bottom-nav.tsx` — custom bar, not Material NavigationBar.
class FoodAppBottomNav extends StatelessWidget {
  const FoodAppBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.cartCount = 0,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final int cartCount;

  static const _icons = [
    Icons.restaurant_outlined,
    Icons.storefront_outlined,
    Icons.shopping_bag_outlined,
    Icons.person_outline,
  ];

  static const _iconsActive = [
    Icons.restaurant,
    Icons.storefront,
    Icons.shopping_bag,
    Icons.person,
  ];

  static const _labels = [
    AppStrings.navRestaurants,
    AppStrings.navStores,
    AppStrings.navCart,
    AppStrings.navProfile,
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border.withValues(alpha: 0.9))),
        boxShadow: AppShadows.nav,
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Row(
            children: List.generate(4, (index) {
              final active = index == currentIndex;
              return Expanded(
                child: InkWell(
                  onTap: () => onTap(index),
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: active ? AppColors.primarySoft : Colors.transparent,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              alignment: Alignment.center,
                              child: Icon(
                                active ? _iconsActive[index] : _icons[index],
                                size: 22,
                                color: active ? AppColors.primary : AppColors.textMuted,
                              ),
                            ),
                            if (index == 2 && cartCount > 0)
                              Positioned(
                                right: -2,
                                top: -2,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    cartCount > 99 ? '99+' : '$cartCount',
                                    style: AppTypography.caption.copyWith(
                                      color: Colors.white,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _labels[index],
                          style: AppTypography.caption.copyWith(
                            fontSize: 10,
                            fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                            color: active ? AppColors.primary : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
