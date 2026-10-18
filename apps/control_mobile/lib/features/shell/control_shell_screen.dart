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
      var bottomIndex = mobileItems.indexWhere((e) => e.value.route == currentRoute);
      if (bottomIndex < 0) bottomIndex = 0;

      return Scaffold(
        appBar: AppBar(
          titleSpacing: 16,
          title: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  size: 18,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                AppStrings.appName,
                style: AppTypography.subtitle.copyWith(
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: IconButton(
                tooltip: AppStrings.logout,
                onPressed: () => ref.read(authStateProvider.notifier).logout(),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.surfaceMuted,
                  foregroundColor: AppColors.textSecondary,
                ),
                icon: const Icon(Icons.logout_rounded, size: 20),
              ),
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: AppColors.borderLight),
          ),
        ),
        body: navigationShell,
        bottomNavigationBar: NavigationBar(
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
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.appName,
                    style: AppTypography.title.copyWith(color: AppColors.onSidebar),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.appTagline,
                    style: AppTypography.caption.copyWith(color: AppColors.onSidebarMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: controlNavItems.length,
                itemBuilder: (context, index) {
                  final item = controlNavItems[index];
                  final selected = index == selectedIndex;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Material(
                      color: selected ? AppColors.sidebarMuted : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      child: ListTile(
                        leading: Icon(
                          item.icon,
                          color: selected ? AppColors.onSidebar : AppColors.onSidebarMuted,
                        ),
                        title: Text(
                          item.label,
                          style: AppTypography.body.copyWith(
                            color: selected ? AppColors.onSidebar : AppColors.onSidebarMuted,
                            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                        selected: selected,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
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
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.sidebarMuted,
                    child: Icon(Icons.shield_outlined, color: AppColors.onSidebar, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      userName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.onSidebar),
                    ),
                  ),
                  IconButton(
                    tooltip: AppStrings.logout,
                    onPressed: onLogout,
                    icon: const Icon(Icons.logout, color: AppColors.onSidebarMuted),
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
