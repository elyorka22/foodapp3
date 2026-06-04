import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import 'lucide_nav_icons.dart';

/// Bottom bar: home, cart, profile — icons only (matches web).
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

  static const _iconSize = 28.0;
  static const _tapSize = 52.0;
  static const _bgSize = 48.0;

  static const _labels = [
    AppStrings.navHome,
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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(3, (index) {
              final active = index == currentIndex;
              return Semantics(
                label: _labels[index],
                button: true,
                child: InkWell(
                  onTap: () => onTap(index),
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  child: SizedBox(
                    width: _tapSize,
                    height: _tapSize,
                    child: Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: _bgSize,
                          height: _bgSize,
                          decoration: BoxDecoration(
                            color: active ? AppColors.primarySoft : Colors.transparent,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          alignment: Alignment.center,
                          child: _navIcon(
                            index: index,
                            active: active,
                            color: active ? AppColors.primary : AppColors.textMuted,
                          ),
                        ),
                        if (index == 1 && cartCount > 0)
                          Positioned(
                            right: 2,
                            top: 2,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                              child: Text(
                                cartCount > 99 ? '99+' : '$cartCount',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
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

  Widget _navIcon({
    required int index,
    required bool active,
    required Color color,
  }) {
    switch (index) {
      case 0:
        return LucideHomeNavIcon(size: _iconSize, color: color, active: active);
      case 1:
        return LucideShoppingBasketNavIcon(size: _iconSize, color: color, active: active);
      default:
        return LucideUserNavIcon(size: _iconSize, color: color, active: active);
    }
  }
}
