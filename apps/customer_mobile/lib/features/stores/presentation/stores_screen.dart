import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_url.dart';
import '../../../shared/models/business_model.dart';
import '../../../core/utils/safe_area_padding.dart';
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(AppStrings.navStores, style: AppTypography.title),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(businessTypesProvider);
          ref.invalidate(storesListProvider);
        },
        child: ListView(
          padding: scrollSafePadding(
            context,
            base: const EdgeInsets.all(AppSpacing.lg),
          ),
          children: [
            Text(
              AppStrings.storesSubtitle,
              style: AppTypography.bodySmall,
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: AppStrings.searchStores,
                prefixIcon: Icon(Icons.search),
              ),
              onSubmitted: (v) => setState(() => _search = v.trim()),
            ),
            const SizedBox(height: AppSpacing.lg),
            types.when(
              data: (list) {
                final filtered = list.where((t) => t.slug != 'restaurant').toList();
                if (filtered.isEmpty) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AppStrings.categories, style: AppTypography.subtitle),
                    const SizedBox(height: AppSpacing.sm),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 4 / 3,
                      ),
                      itemCount: filtered.length,
                      itemBuilder: (_, i) => _BusinessTypeTile(
                        type: filtered[i],
                        selected: _selectedType == filtered[i].slug,
                        onTap: () => setState(() {
                          _selectedType =
                              _selectedType == filtered[i].slug ? null : filtered[i].slug;
                        }),
                      ),
                    ),
                  ],
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => const SizedBox.shrink(),
            ),
            if (_selectedType != null || _search.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(AppStrings.popular, style: AppTypography.subtitle),
              const SizedBox(height: AppSpacing.md),
              stores.when(
                data: (list) {
                  if (list.isEmpty) {
                    return Text(AppStrings.storesEmpty, style: AppTypography.bodySmall);
                  }
                  return Column(
                    children: [
                      for (final s in list) ...[
                        FoodAppStoreCard(
                          store: s,
                          onTap: () => context.push('/stores/${s.slug}'),
                        ),
                        const SizedBox(height: AppSpacing.md),
                      ],
                    ],
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Text('$e'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _BusinessTypeTile extends StatelessWidget {
  const _BusinessTypeTile({
    required this.type,
    required this.selected,
    required this.onTap,
  });

  final BusinessTypeModel type;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final url = resolveImageUrl(type.imageUrl);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.primary : Colors.transparent,
              width: 2,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: url != null
                  ? CachedNetworkImage(imageUrl: url, fit: BoxFit.cover)
                  : ColoredBox(
                      color: AppColors.primarySoft,
                      child: Center(
                        child: Text(
                          type.name,
                          style: AppTypography.subtitle,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
