import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/image_framing_controls.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/catalog_repository.dart';
import '../data/dish_category_model.dart';
import '../data/product_model.dart';

final catalogListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlProduct>>((ref) {
  return ref.watch(catalogRepositoryProvider).fetchProducts(page: 1, limit: 40);
});

final dishCategoriesProvider =
    FutureProvider.autoDispose<List<ControlDishCategory>>((ref) {
  return ref.watch(catalogRepositoryProvider).fetchDishCategoriesAdmin();
});

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Text(AppStrings.catalogTitle, style: AppTypography.display),
        ),
        TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: AppStrings.categoriesSection),
            Tab(text: AppStrings.productsSection),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: const [
              _CategoriesTab(),
              _ProductsTab(),
            ],
          ),
        ),
      ],
    );
  }
}

class _CategoriesTab extends ConsumerWidget {
  const _CategoriesTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(dishCategoriesProvider);

    return AsyncPageBody<List<ControlDishCategory>>(
      asyncValue: async,
      onRefresh: () => ref.refresh(dishCategoriesProvider.future),
      // Always show dataBuilder so "Kategoriya + rasm" stays visible when empty.
      padding: const EdgeInsets.all(AppSpacing.lg),
      dataBuilder: (categories) {
        final rows = [...categories]
          ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FilledButton.icon(
              onPressed: () => showDetailSheet(
                context: context,
                title: AppStrings.addCategory,
                initialChildSize: 0.92,
                builder: (_) => const _CategoryFormSheet(),
              ),
              icon: const Icon(Icons.add_photo_alternate_outlined),
              label: const Text(AppStrings.addCategory),
            ),
            const SizedBox(height: 12),
            Text(
              AppStrings.categoryImageHint,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            if (rows.isEmpty) ...[
              const SizedBox(height: 16),
              Text(
                AppStrings.categoryEmptyHint,
                style: AppTypography.bodySmall,
              ),
            ],
            const SizedBox(height: 12),
            ...rows.map((c) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ControlListCard(
                  leading: _CategoryThumb(category: c),
                  title: c.name,
                  subtitle: [
                    if (c.slug.isNotEmpty) c.slug,
                    'masshtab ${c.framing.imageScale}%',
                  ].join(' · '),
                  trailing: StatusChip(
                    status: c.isActive ? 'DELIVERED' : 'CANCELLED',
                    label: c.isActive ? AppStrings.active : AppStrings.inactive,
                  ),
                  onTap: () => showDetailSheet(
                    context: context,
                    title: AppStrings.editCategory,
                    initialChildSize: 0.92,
                    builder: (_) => _CategoryFormSheet(category: c),
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}

class _CategoryThumb extends StatelessWidget {
  const _CategoryThumb({required this.category});

  final ControlDishCategory category;

  @override
  Widget build(BuildContext context) {
    final url = category.imageUrl?.trim() ?? '';
    final framing = category.framing;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 48,
        height: 48,
        child: url.isEmpty
            ? const ColoredBox(
                color: Color(0xFFE4E4E7),
                child: Icon(Icons.category_outlined, size: 22),
              )
            : Transform.scale(
                scale: framing.imageScale / 100,
                alignment: Alignment(
                  (framing.imagePositionX / 50) - 1,
                  (framing.imagePositionY / 50) - 1,
                ),
                child: Image.network(
                  url,
                  fit: BoxFit.cover,
                  alignment: Alignment(
                    (framing.imagePositionX / 50) - 1,
                    (framing.imagePositionY / 50) - 1,
                  ),
                  errorBuilder: (_, __, ___) => const ColoredBox(
                    color: Color(0xFFE4E4E7),
                    child: Icon(Icons.broken_image_outlined, size: 20),
                  ),
                ),
              ),
      ),
    );
  }
}

class _CategoryFormSheet extends ConsumerStatefulWidget {
  const _CategoryFormSheet({this.category});

  final ControlDishCategory? category;

  @override
  ConsumerState<_CategoryFormSheet> createState() => _CategoryFormSheetState();
}

class _CategoryFormSheetState extends ConsumerState<_CategoryFormSheet> {
  late final TextEditingController _name;
  late final TextEditingController _description;
  late final TextEditingController _imageUrl;
  late final TextEditingController _sortOrder;
  late ImageFramingValues _framing;
  bool _isActive = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final c = widget.category;
    _name = TextEditingController(text: c?.name ?? '');
    _description = TextEditingController(text: c?.description ?? '');
    _imageUrl = TextEditingController(text: c?.imageUrl ?? '');
    _sortOrder = TextEditingController(text: '${c?.sortOrder ?? 0}');
    _framing = c?.framing ?? const ImageFramingValues();
    _isActive = c?.isActive ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _imageUrl.dispose();
    _sortOrder.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.length < 2) {
      showActionSnackBar(context, 'Nom kamida 2 belgi', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(catalogRepositoryProvider);
      final sortOrder = int.tryParse(_sortOrder.text.trim()) ?? 0;
      final imageUrl = _imageUrl.text.trim();
      final desc = _description.text.trim();
      if (widget.category == null) {
        await repo.createDishCategory(
          name: name,
          description: desc.isEmpty ? null : desc,
          imageUrl: imageUrl.isEmpty ? null : imageUrl,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
          sortOrder: sortOrder,
          isActive: _isActive,
        );
      } else {
        await repo.updateDishCategory(
          widget.category!.id,
          name: name,
          description: desc,
          imageUrl: imageUrl,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
          sortOrder: sortOrder,
          isActive: _isActive,
        );
      }
      ref.invalidate(dishCategoriesProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final id = widget.category?.id;
    if (id == null) return;
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeleteCategory,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(catalogRepositoryProvider).deleteDishCategory(id);
      ref.invalidate(dishCategoriesProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.categoryName),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _description,
          enabled: !_busy,
          maxLines: 2,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerDescription),
        ),
        const SizedBox(height: 12),
        ImageUploadField(
          imageUrlController: _imageUrl,
          framing: _framing,
          onFramingChanged: (v) => setState(() => _framing = v),
          enabled: !_busy,
          aspectRatio: 1,
          refererPath: '/admin/restaurants',
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _sortOrder,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerSortOrder),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(AppStrings.active),
          value: _isActive,
          onChanged: _busy ? null : (v) => setState(() => _isActive = v),
        ),
        MutationButton(
          label: AppStrings.save,
          loading: _busy,
          onPressed: _busy ? null : _save,
        ),
        if (widget.category != null) ...[
          const SizedBox(height: 8),
          MutationButton(
            label: AppStrings.delete,
            filled: false,
            destructive: true,
            loading: _busy,
            onPressed: _busy ? null : _delete,
          ),
        ],
      ],
    );
  }
}

class _ProductsTab extends ConsumerWidget {
  const _ProductsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(catalogListProvider);

    return AsyncPageBody<PaginatedResponse<ControlProduct>>(
      asyncValue: async,
      onRefresh: () => ref.refresh(catalogListProvider.future),
      isEmpty: (p) => p.data.isEmpty,
      emptyMessage: AppStrings.emptyList,
      padding: const EdgeInsets.all(AppSpacing.lg),
      dataBuilder: (page) {
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: page.data.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final p = page.data[index];
            return ControlListCard(
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(10),
                ),
                clipBehavior: Clip.antiAlias,
                child: p.imageUrl != null && p.imageUrl!.isNotEmpty
                    ? Image.network(
                        p.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.fastfood_outlined,
                          color: AppColors.textMuted,
                        ),
                      )
                    : const Icon(
                        Icons.fastfood_outlined,
                        color: AppColors.textMuted,
                      ),
              ),
              title: p.name,
              subtitle: [
                if (p.businessName != null) p.businessName!,
                if (p.categoryName != null) p.categoryName!,
                formatMoney(p.price),
              ].join(' · '),
              trailing: StatusChip(
                status: p.isAvailable ? 'DELIVERED' : 'CANCELLED',
                label: p.isAvailable ? 'Mavjud' : 'Yopiq',
              ),
              onTap: () => showDetailSheet(
                context: context,
                title: AppStrings.details,
                builder: (_) => _ProductActions(product: p),
              ),
            );
          },
        );
      },
    );
  }
}

class _ProductActions extends ConsumerStatefulWidget {
  const _ProductActions({required this.product});

  final ControlProduct product;

  @override
  ConsumerState<_ProductActions> createState() => _ProductActionsState();
}

class _ProductActionsState extends ConsumerState<_ProductActions> {
  late ControlProduct _product;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _product = widget.product;
  }

  Future<void> _toggle() async {
    setState(() => _busy = true);
    try {
      final updated = await ref.read(catalogRepositoryProvider).updateProduct(
            _product.id,
            isAvailable: !_product.isAvailable,
          );
      setState(() => _product = updated);
      ref.invalidate(catalogListProvider);
      if (mounted) showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeleteProduct,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(catalogRepositoryProvider).deleteProduct(_product.id);
      ref.invalidate(catalogListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        MutationButton(
          label: AppStrings.toggleAvailability,
          loading: _busy,
          onPressed: _busy ? null : _toggle,
        ),
        const SizedBox(height: 8),
        MutationButton(
          label: AppStrings.softDeleteProduct,
          filled: false,
          destructive: true,
          loading: _busy,
          onPressed: _busy ? null : _delete,
        ),
      ],
    );
  }
}
