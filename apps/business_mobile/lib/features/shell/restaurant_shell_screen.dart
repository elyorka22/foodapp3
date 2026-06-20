import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';

class RestaurantShellScreen extends StatelessWidget {
  const RestaurantShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: navigationShell,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.notifications_active_outlined),
            selectedIcon: Icon(Icons.notifications_active),
            label: AppStrings.newOrders,
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_menu_outlined),
            selectedIcon: Icon(Icons.restaurant_menu),
            label: AppStrings.menu,
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart),
            label: AppStrings.statistics,
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: AppStrings.profile,
          ),
        ],
      ),
    );
  }
}
