import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';

class RestaurantShellScreen extends StatelessWidget {
  const RestaurantShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _active = AppColors.restaurant;
  static const _idle = AppColors.textSecondaryRestaurant;

  @override
  Widget build(BuildContext context) {
    final index = navigationShell.currentIndex;

    return Scaffold(
      backgroundColor: AppColors.backgroundRestaurant,
      body: SafeArea(
        bottom: false,
        child: navigationShell,
      ),
      bottomNavigationBar: Material(
        color: AppColors.surface,
        child: SafeArea(
          top: false,
          child: Container(
            height: 72,
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: AppColors.borderRestaurant),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                _NavItem(
                  label: AppStrings.orders,
                  selected: index == 0,
                  onTap: () => navigationShell.goBranch(0),
                  icon: Icons.receipt_long_outlined,
                ),
                _NavItem(
                  label: AppStrings.menu,
                  selected: index == 1,
                  onTap: () => navigationShell.goBranch(1),
                  icon: Icons.restaurant_menu_outlined,
                ),
                _NavItem(
                  label: AppStrings.statistics,
                  selected: index == 2,
                  onTap: () => navigationShell.goBranch(2),
                  icon: Icons.bar_chart_outlined,
                ),
                _NavItem(
                  label: AppStrings.profile,
                  selected: index == 3,
                  onTap: () => navigationShell.goBranch(3),
                  icon: Icons.person_outline,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.selected,
    required this.onTap,
    required this.icon,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final color =
        selected ? RestaurantShellScreen._active : RestaurantShellScreen._idle;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 12,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: color,
                height: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
