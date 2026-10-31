import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../orders/presentation/available_orders_watcher.dart';

class CourierShellScreen extends ConsumerWidget {
  const CourierShellScreen({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final index = navigationShell.currentIndex;
    final items = [
      (AppStrings.tabHome, Icons.home_outlined, Icons.home_rounded),
      (AppStrings.tabJobs, Icons.inventory_2_outlined, Icons.inventory_2_rounded),
      (AppStrings.tabStatistics, Icons.account_balance_wallet_outlined, Icons.account_balance_wallet_rounded),
      (AppStrings.tabProfile, Icons.person_outline_rounded, Icons.person_rounded),
    ];

    return AvailableOrdersWatcher(
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: navigationShell,
        bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Container(
              height: 62,
              padding: const EdgeInsets.symmetric(horizontal: 6),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(31),
                border: Border.all(color: AppColors.border),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0F000000),
                    blurRadius: 12,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  for (var i = 0; i < items.length; i++)
                    Expanded(
                      child: _PillNavButton(
                        selected: index == i,
                        label: items[i].$1,
                        icon: items[i].$2,
                        selectedIcon: items[i].$3,
                        onTap: () => _onTap(i),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PillNavButton extends StatelessWidget {
  const _PillNavButton({
    required this.selected,
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.onTap,
  });

  final bool selected;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    if (selected) {
      return Center(
        child: Material(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(22),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(22),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              child: Text(
                label,
                style: AppTypography.caption.copyWith(
                  color: AppColors.onPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ),
      );
    }

    return IconButton(
      onPressed: onTap,
      tooltip: label,
      icon: Icon(icon, color: AppColors.textSecondary, size: 24),
    );
  }
}
