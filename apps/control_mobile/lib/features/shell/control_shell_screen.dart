import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/layout/breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../auth/providers/auth_provider.dart';
import '../business_types/data/business_types_repository.dart';
import 'control_nav_items.dart';
import 'control_vertical_scope.dart';

final _navBusinessTypesProvider =
    FutureProvider.autoDispose<List<ControlBusinessType>>((ref) {
  return ref.watch(businessTypesRepositoryProvider).fetchTypes();
});

class ControlShellScreen extends ConsumerWidget {
  const ControlShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _goBranch(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  void _selectEntry(WidgetRef ref, ControlNavEntry entry) {
    ref.read(controlVerticalScopeProvider.notifier).state = entry.scope;
    ref.read(controlNavEntryIdProvider.notifier).state = entry.id;
    if (entry.catalogIntent != null) {
      ref.read(catalogNavIntentProvider.notifier).state = entry.catalogIntent!;
    }
    _goBranch(entry.branchIndex);
  }

  String _currentLabel(WidgetRef ref, List<ControlNavSection> sections) {
    final entryId = ref.watch(controlNavEntryIdProvider);
    if (entryId != null) {
      for (final section in sections) {
        for (final entry in section.entries) {
          if (entry.id == entryId) return entry.label;
        }
      }
    }
    final branch = navigationShell.currentIndex;
    for (final section in sections) {
      for (final entry in section.entries) {
        if (entry.branchIndex == branch) return entry.label;
      }
    }
    return AppStrings.appShortName;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final userName = user?.fullName.isNotEmpty == true
        ? user!.fullName
        : (user?.email ?? 'SUPER_ADMIN');
    final compact = Breakpoints.isCompact(context);
    final typesAsync = ref.watch(_navBusinessTypesProvider);
    final sections = buildControlNavSections(
      typesAsync.valueOrNull ?? const <ControlBusinessType>[],
    );
    final selectedEntryId = ref.watch(controlNavEntryIdProvider);

    void logout() => ref.read(authStateProvider.notifier).logout();

    if (compact) {
      var bottomIndex = controlMobileNavEntries.indexWhere(
        (e) => e.branchIndex == navigationShell.currentIndex,
      );
      if (bottomIndex < 0) bottomIndex = 0;

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          titleSpacing: 0,
          leading: Builder(
            builder: (ctx) => IconButton(
              tooltip: AppStrings.menuOpen,
              onPressed: () => Scaffold.of(ctx).openDrawer(),
              icon: const Icon(Icons.menu_rounded, size: 22),
            ),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.appShortName,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.4,
                ),
              ),
              Text(
                _currentLabel(ref, sections),
                style: AppTypography.subtitle.copyWith(fontSize: 15),
              ),
            ],
          ),
          actions: [
            IconButton(
              tooltip: AppStrings.logout,
              onPressed: logout,
              icon: const Icon(Icons.logout_rounded, size: 20),
            ),
            const SizedBox(width: 4),
          ],
          bottom: const PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Divider(height: 1),
          ),
        ),
        drawer: _ControlDrawer(
          sections: sections,
          selectedEntryId: selectedEntryId,
          selectedBranch: navigationShell.currentIndex,
          userName: userName,
          onSelect: (entry) {
            Navigator.of(context).pop();
            _selectEntry(ref, entry);
          },
          onLogout: () {
            Navigator.of(context).pop();
            logout();
          },
        ),
        body: navigationShell,
        bottomNavigationBar: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Divider(height: 1),
            NavigationBar(
              selectedIndex: bottomIndex.clamp(
                0,
                controlMobileNavEntries.length - 1,
              ),
              onDestinationSelected: (i) {
                _selectEntry(ref, controlMobileNavEntries[i]);
              },
              destinations: [
                for (final item in controlMobileNavEntries)
                  NavigationDestination(
                    icon: Icon(item.icon),
                    selectedIcon: Icon(item.icon),
                    label: item.label,
                  ),
              ],
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Row(
        children: [
          _ControlSidebar(
            sections: sections,
            selectedEntryId: selectedEntryId,
            selectedBranch: navigationShell.currentIndex,
            userName: userName,
            onSelect: (entry) => _selectEntry(ref, entry),
            onLogout: logout,
          ),
          const VerticalDivider(width: 1, color: AppColors.borderLight),
          Expanded(child: navigationShell),
        ],
      ),
    );
  }
}

class _ControlDrawer extends StatelessWidget {
  const _ControlDrawer({
    required this.sections,
    required this.selectedEntryId,
    required this.selectedBranch,
    required this.userName,
    required this.onSelect,
    required this.onLogout,
  });

  final List<ControlNavSection> sections;
  final String? selectedEntryId;
  final int selectedBranch;
  final String userName;
  final ValueChanged<ControlNavEntry> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: _NavPanel(
        sections: sections,
        selectedEntryId: selectedEntryId,
        selectedBranch: selectedBranch,
        userName: userName,
        onSelect: onSelect,
        onLogout: onLogout,
        showBrandMark: true,
      ),
    );
  }
}

class _ControlSidebar extends StatelessWidget {
  const _ControlSidebar({
    required this.sections,
    required this.selectedEntryId,
    required this.selectedBranch,
    required this.userName,
    required this.onSelect,
    required this.onLogout,
  });

  final List<ControlNavSection> sections;
  final String? selectedEntryId;
  final int selectedBranch;
  final String userName;
  final ValueChanged<ControlNavEntry> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: AppSpacing.sidebarWidth,
      child: _NavPanel(
        sections: sections,
        selectedEntryId: selectedEntryId,
        selectedBranch: selectedBranch,
        userName: userName,
        onSelect: onSelect,
        onLogout: onLogout,
        showBrandMark: true,
      ),
    );
  }
}

class _NavPanel extends StatelessWidget {
  const _NavPanel({
    required this.sections,
    required this.selectedEntryId,
    required this.selectedBranch,
    required this.userName,
    required this.onSelect,
    required this.onLogout,
    required this.showBrandMark,
  });

  final List<ControlNavSection> sections;
  final String? selectedEntryId;
  final int selectedBranch;
  final String userName;
  final ValueChanged<ControlNavEntry> onSelect;
  final VoidCallback onLogout;
  final bool showBrandMark;

  bool _isSelected(ControlNavEntry entry) {
    if (selectedEntryId != null) return entry.id == selectedEntryId;
    return entry.branchIndex == selectedBranch;
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppColors.sidebar,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (showBrandMark)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.sidebarAccent.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.sidebarAccent.withOpacity(0.45),
                        ),
                      ),
                      child: Text(
                        'F',
                        style: AppTypography.subtitle.copyWith(
                          color: AppColors.onSidebar,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.appName,
                            style: AppTypography.subtitle.copyWith(
                              color: AppColors.onSidebar,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            AppStrings.appTagline,
                            style: AppTypography.overline.copyWith(
                              color: AppColors.onSidebarMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 12),
                children: [
                  for (final group in sections) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 12, 8, 6),
                      child: Text(
                        group.label.toUpperCase(),
                        style: AppTypography.overline,
                      ),
                    ),
                    for (final entry in group.entries)
                      _NavTile(
                        item: entry,
                        selected: _isSelected(entry),
                        onTap: () => onSelect(entry),
                      ),
                  ],
                ],
              ),
            ),
            const Divider(color: AppColors.sidebarMuted, height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 8, 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 15,
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
                        fontSize: 12,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: AppStrings.logout,
                    onPressed: onLogout,
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(
                      Icons.logout_rounded,
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

class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final ControlNavEntry item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: selected ? AppColors.sidebarHover : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
            child: Row(
              children: [
                Icon(
                  item.icon,
                  size: 18,
                  color: selected
                      ? AppColors.onSidebar
                      : AppColors.onSidebarMuted,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
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
                ),
                if (selected)
                  Container(
                    width: 4,
                    height: 4,
                    decoration: const BoxDecoration(
                      color: AppColors.sidebarAccent,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
