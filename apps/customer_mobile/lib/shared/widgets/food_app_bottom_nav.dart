import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import 'lucide_nav_icons.dart';

/// Bottom bar matching web `bottom-nav.tsx`: icons + labels, brand purple active.
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

  static const _homeIconSize = 28.0;
  static const _iconSize = 31.0;

  static const _labels = [
    AppStrings.navHome,
    AppStrings.navCart,
    AppStrings.navProfile,
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(color: Color(0xFFF4F4F5)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
          child: Row(
            children: List.generate(3, (index) {
              final active = index == currentIndex;
              return Expanded(
                child: Semantics(
                  label: _labels[index],
                  button: true,
                  selected: active,
                  child: InkWell(
                    onTap: () => onTap(index),
                    borderRadius: BorderRadius.circular(16),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            height: 48,
                            width: 48,
                            child: Stack(
                              clipBehavior: Clip.none,
                              alignment: Alignment.center,
                              children: [
                                _navIcon(index: index, active: active),
                                if (index == 1 && cartCount > 0)
                                  Positioned(
                                    right: 0,
                                    top: 0,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 5,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.brand,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      constraints: const BoxConstraints(
                                        minWidth: 18,
                                        minHeight: 18,
                                      ),
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
                          const SizedBox(height: 4),
                          Text(
                            _labels[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              height: 1,
                              letterSpacing: -0.2,
                              fontWeight:
                                  active ? FontWeight.w600 : FontWeight.w500,
                              color: active
                                  ? AppColors.brand
                                  : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
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

  Widget _navIcon({required int index, required bool active}) {
    final color = active ? AppColors.brand : AppColors.textMuted;
    switch (index) {
      case 0:
        return LucideHomeNavIcon(
          size: _homeIconSize,
          color: color,
          active: active,
        );
      case 1:
        return LucideShoppingBasketNavIcon(
          size: _iconSize,
          color: color,
        );
      default:
        return LucideUserNavIcon(
          size: _iconSize,
          color: color,
        );
    }
  }
}
