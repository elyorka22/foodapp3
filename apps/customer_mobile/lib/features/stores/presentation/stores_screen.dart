import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_store_card.dart';
import '../providers/stores_provider.dart';

class StoresScreen extends ConsumerStatefulWidget {
  const StoresScreen({super.key});

  @override
  ConsumerState<StoresScreen> createState() => _StoresScreenState();
}

class _StoresScreenState extends ConsumerState<StoresScreen> {
  final _searchController = TextEditingController();
  String? _selectedType;
  String _search = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final types = ref.watch(businessTypesProvider);
    final query = StoresQuery(search: _search.isEmpty ? null : _search, typeSlug: _selectedType);
    final stores = ref.watch(storesListProvider(query));

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.navStores, style: AppTypography.title)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(businessTypesProvider);
          ref.invalidate(storesListProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: AppStrings.searchStores,
                prefixIcon: const Icon(Icons.search),
              ),
              onSubmitted: (v) => setState(() => _search = v.trim()),
            ),
            const SizedBox(height: AppSpacing.md),
            types.when(
              data: (list) {
                final filtered = list.where((t) => t.slug != 'restaurant').toList();
                if (filtered.isEmpty) return const SizedBox.shrink();
                return SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(AppStrings.seeAll),
                          selected: _selectedType == null,
                          onSelected: (_) => setState(() => _selectedType = null),
                        ),
                      ),
                      for (final t in filtered)
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(t.name),
                            selected: _selectedType == t.slug,
                            onSelected: (_) => setState(() => _selectedType = t.slug),
                          ),
                        ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: AppSpacing.lg),
            stores.when(
              data: (list) => Column(
                children: [
                  for (final s in list) ...[
                    FoodAppStoreCard(
                      store: s,
                      onTap: () => context.go('/stores/${s.slug}'),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],
                ],
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('$e'),
            ),
          ],
        ),
      ),
    );
  }
}
