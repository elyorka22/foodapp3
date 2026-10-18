import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/layout/breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../auth/providers/auth_provider.dart';
import 'control_nav_items.dart';

class ControlShellScreen extends ConsumerWidget {
  const ControlShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _goBranch(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final compact = Breakpoints.isCompact(context);
    final mobileItems = controlNavItems
        .asMap()
        .entries
        .where((e) => e.value.mobile)
        .toList();

    if (compact) {
      final currentRoute = controlNavItems[navigationShell.currentIndex].route;
      var bottomIndex =
          mobileItems.indexWhere((e) => e.value.route == currentRoute);
      if (bottomIndex < 0) bottomIndex = 0;

      return Scaffold(
        appBar: AppBar(
          titleSpacing: 16,
          title: Text(
            AppStrings.appName,
            style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
          ),
          actions: [
            IconButton(
              tooltip: AppStrings.logout,
              onPressed: () => ref.read(authStateProvider.notifier).logout(),
              icon: const Icon(Icons.logout_rounded, size: 20),
            ),
            const SizedBox(width: 4),
          ],
          bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Divider(height: 1),
          ),
        ),
        body: navigationShell,
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Divider(height: 1),
            NavigationBar(
              selectedIndex: bottomIndex,
              onDestinationSelected: (i) => _goBranch(mobileItems[i].key),
              destinations: [
                for (final item in mobileItems)
                  NavigationDestination(
                    icon: Icon(item.value.icon),
                    selectedIcon: Icon(item.value.icon),
                    label: item.value.label,
                  ),
              ],
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          _DesktopSidebar(
            selectedIndex: navigationShell.currentIndex,
            userName: user?.fullName.isNotEmpty == true
                ? user!.fullName
                : (user?.email ?? 'SUPER_ADMIN'),
            onSelect: _goBranch,
            onLogout: () => ref.read(authStateProvider.notifier).logout(),
          ),
          const VerticalDivider(width: 1),
          Expanded(child: navigationShell),
        ],
      ),
    );
  }
}

class _DesktopSidebar extends StatelessWidget {
  const _DesktopSidebar({
    required this.selectedIndex,
    required this.userName,
    required this.onSelect,
    required this.onLogout,
  });

  final int selectedIndex;
  final String userName;
  final ValueChanged<int> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: AppSpacing.sidebarWidth,
      color: AppColors.sidebar,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.appName,
                    style: AppTypography.title.copyWith(
                      color: AppColors.onSidebar,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    AppStrings.appTagline,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.onSidebarMuted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                itemCount: controlNavItems.length,
                itemBuilder: (context, index) {
                  final item = controlNavItems[index];
                  final selected = index == selectedIndex;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Material(
                      color: selected
                          ? AppColors.sidebarMuted
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                      child: ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: Icon(
                          item.icon,
                          size: 20,
                          color: selected
                              ? AppColors.onSidebar
                              : AppColors.onSidebarMuted,
                        ),
                        title: Text(
                          item.label,
                          style: AppTypography.body.copyWith(
                            fontSize: 13,
                            color: selected
                                ? AppColors.onSidebar
                                : AppColors.onSidebarMuted,
                            fontWeight:
                                selected ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                        selected: selected,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        onTap: () => onSelect(index),
                      ),
                    ),
                  );
                },
              ),
            ),
            const Divider(color: AppColors.sidebarMuted, height: 1),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.sidebarMuted,
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'A',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.onSidebar,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      userName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.onSidebar,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: AppStrings.logout,
                    onPressed: onLogout,
                    icon: const Icon(
                      Icons.logout,
                      color: AppColors.onSidebarMuted,
                      size: 18,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
