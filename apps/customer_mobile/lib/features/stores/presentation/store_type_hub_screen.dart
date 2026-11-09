import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_url.dart';
import '../../../core/utils/restaurant_card_meta.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/models/business_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/circle_icon_button.dart';
import '../data/stores_repository.dart';
import '../providers/stores_provider.dart';

const _typeTitles = <String, String>{
  'flowers': AppStrings.homeServiceFlowers,
  'perfume': AppStrings.homeServiceCosmetics,
  'pharmacy': AppStrings.homeServicePharmacy,
  'grocery': AppStrings.homeServiceProducts,
  'gift': "Sovg'alar",
  'electronics': 'Elektronika',
};

class _HubCategory {
  const _HubCategory({
    required this.key,
    required this.name,
    this.imageUrl,
  });

  final String key;
  final String name;
  final String? imageUrl;
}

/// Flowers / cosmetics style hub: shops carousel + search + 3-col category grid.
class StoreTypeHubScreen extends ConsumerStatefulWidget {
  const StoreTypeHubScreen({
    super.key,
    required this.typeSlug,
    this.titleOverride,
  });

  final String typeSlug;
  final String? titleOverride;

  @override
  ConsumerState<StoreTypeHubScreen> createState() => _StoreTypeHubScreenState();
}

class _StoreTypeHubScreenState extends ConsumerState<StoreTypeHubScreen> {
  final _searchController = TextEditingController();
  String _query = '';
  List<_HubCategory> _categories = const [];
  bool _catsLoading = false;
  String? _loadedForKey;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String get _title =>
      widget.titleOverride ??
      _typeTitles[widget.typeSlug] ??
      widget.typeSlug;

  void _ensureCategories() {
    final key = widget.typeSlug;
    if (_loadedForKey == key || _catsLoading) return;
    _catsLoading = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      setState(() {});
      final cats = await _loadCategories(widget.typeSlug);
      if (!mounted) return;
      setState(() {
        _categories = cats;
        _catsLoading = false;
        _loadedForKey = key;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final storesAsync = ref.watch(
      storesListProvider(StoresQuery(typeSlug: widget.typeSlug)),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            _loadedForKey = null;
            ref.invalidate(storesListProvider);
          },
          child: storesAsync.when(
            data: (stores) {
              _ensureCategories();
              return _body(stores);
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  child: Text('$e', style: AppTypography.bodySmall),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _body(List<BusinessModel> stores) {
    final q = _query.trim().toLowerCase();
    final filteredStores = q.isEmpty
        ? stores
        : stores.where((s) => s.name.toLowerCase().contains(q)).toList();
    final filteredCats = q.isEmpty
        ? _categories
        : _categories.where((c) => c.name.toLowerCase().contains(q)).toList();

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: scrollSafePadding(
        context,
        base: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          AppSpacing.xl,
        ),
      ),
      children: [
        Row(
          children: [
            CircleIconButton(
              onTap: () => context.pop(),
              icon: Icons.arrow_back_rounded,
            ),
            Expanded(
              child: Text(
                _title,
                textAlign: TextAlign.center,
                style: AppTypography.title.copyWith(
                  fontWeight: FontWeight.w800,
                  fontSize: 20,
                ),
              ),
            ),
            const SizedBox(width: 40),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Text(
              AppStrings.navStores,
              style: AppTypography.subtitle.copyWith(
                fontWeight: FontWeight.w800,
                fontSize: 17,
              ),
            ),
            const Spacer(),
            IconButton(
              onPressed: () => context.push(
                AppRoutes.storesWithType(widget.typeSlug),
              ),
              icon: const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ),
          ],
        ),
        if (filteredStores.isEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Text(
              AppStrings.storesComingSoon,
              style: AppTypography.bodySmall,
            ),
          )
        else
          SizedBox(
            height: 110,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: filteredStores.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, i) => _HubShopCard(
                store: filteredStores[i],
                index: i,
                onTap: () => context.push(
                  AppRoutes.storeDetail(filteredStores[i].slug),
                ),
              ),
            ),
          ),
        const SizedBox(height: AppSpacing.md),
        TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: AppStrings.searchInShops,
            prefixIcon: const Icon(Icons.search),
            filled: true,
            fillColor: const Color(0xFFF4F4F5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(999),
              borderSide: BorderSide.none,
            ),
          ),
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: AppSpacing.md),
        if (_catsLoading)
          const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: CircularProgressIndicator()),
          ),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1 / 1.05,
          children: [
            _CategoryTile(
              title: AppStrings.allCategoryProducts,
              onTap: () => context.push(
                AppRoutes.storesWithType(widget.typeSlug),
              ),
              gradient: true,
            ),
            for (final cat in filteredCats)
              _CategoryTile(
                title: cat.name,
                imageUrl: cat.imageUrl,
                onTap: () => context.push(
                  AppRoutes.storesWithType(widget.typeSlug),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Future<List<_HubCategory>> _loadCategories(String typeSlug) async {
    try {
      final cats = await ref
          .read(storesRepositoryProvider)
          .fetchTypeCategories(typeSlug);
      return cats
          .map((cat) {
            final name = cat.name.trim();
            if (name.isEmpty) return null;
            final key = (cat.slug.isNotEmpty ? cat.slug : cat.id).toLowerCase();
            return _HubCategory(
              key: key,
              name: name,
              imageUrl: cat.imageUrl,
            );
          })
          .whereType<_HubCategory>()
          .toList();
    } catch (_) {
      return const [];
    }
  }
}

class _HubShopCard extends StatelessWidget {
  const _HubShopCard({
    required this.store,
    required this.index,
    required this.onTap,
  });

  final BusinessModel store;
  final int index;
  final VoidCallback onTap;

  static const _tints = [
    Color(0xFFFCE7F3),
    Color(0xFFEDE9FE),
    Color(0xFFFEF3C7),
    Color(0xFFDCFCE7),
    Color(0xFFE0E7FF),
  ];

  @override
  Widget build(BuildContext context) {
    final logo = resolveImageUrl(store.logoUrl ?? store.coverUrl);
    final availability = store.isOpen == false
        ? (store.closesAt?.trim().isNotEmpty == true
            ? store.closesAt!.trim()
            : AppStrings.closed)
        : businessDeliveryLabel(store);
    final min = store.minOrderAmount ?? 0;
    final from = AppStrings.fromPrice(min.round().toString());

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: SizedBox(
        width: 76,
        child: Column(
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: ColoredBox(
                  color: _tints[index % _tints.length],
                  child: logo != null && logo.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: logo,
                          fit: BoxFit.contain,
                          errorWidget: (_, __, ___) => Center(
                            child: Text(
                              store.name.isNotEmpty ? store.name[0] : 'D',
                              style: AppTypography.title,
                            ),
                          ),
                        )
                      : Center(
                          child: Text(
                            store.name.isNotEmpty ? store.name[0] : 'D',
                            style: AppTypography.title,
                          ),
                        ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              availability,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
            ),
            Text(
              from,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: AppTypography.caption.copyWith(
                color: AppColors.textSecondary,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.title,
    required this.onTap,
    this.imageUrl,
    this.gradient = false,
  });

  final String title;
  final VoidCallback onTap;
  final String? imageUrl;
  final bool gradient;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveImageUrl(imageUrl);
    return Material(
      color: const Color(0xFFF4F4F5),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Stack(
            children: [
              if (gradient)
                Positioned(
                  right: -4,
                  bottom: -4,
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(28)),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFFE4E4E7), Color(0xFFF4F4F5)],
                      ),
                    ),
                  ),
                ),
              if (resolved != null && resolved.isNotEmpty)
                Positioned(
                  right: -8,
                  bottom: -8,
                  width: 90,
                  height: 90,
                  child: CachedNetworkImage(
                    imageUrl: resolved,
                    fit: BoxFit.contain,
                    errorWidget: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Text(
                  title,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    height: 1.2,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
