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
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../businesses/data/businesses_repository.dart';
import '../../businesses/data/restaurant_model.dart';
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

final _productBusinessesProvider =
    FutureProvider.autoDispose<List<ControlRestaurant>>((ref) async {
  final page = await ref.watch(businessesRepositoryProvider).fetchRestaurants(
        page: 1,
        limit: 100,
      );
  return page.data;
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
        const PageHeader(
          title: AppStrings.catalogTitle,
          subtitle: AppStrings.categoryImageHint,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Material(
            color: AppColors.surfaceMuted,
            borderRadius: BorderRadius.circular(14),
            child: TabBar(
              controller: _tabs,
              tabs: const [
                Tab(text: AppStrings.categoriesSection),
                Tab(text: AppStrings.productsSection),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
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
      padding: const EdgeInsets.all(AppSpacing.lg),
      dataBuilder: (page) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FilledButton.icon(
              onPressed: () => showDetailSheet(
                context: context,
                title: AppStrings.addProduct,
                initialChildSize: 0.92,
                builder: (_) => const _ProductFormSheet(),
              ),
              icon: const Icon(Icons.add),
              label: const Text(AppStrings.addProduct),
            ),
            if (page.data.isEmpty) ...[
              const SizedBox(height: 16),
              Text(
                AppStrings.productEmptyHint,
                style: AppTypography.bodySmall,
              ),
            ],
            const SizedBox(height: 12),
            ...page.data.map((p) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ControlListCard(
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
                    title: AppStrings.editProduct,
                    initialChildSize: 0.92,
                    builder: (_) => _ProductFormSheet(product: p),
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

class _ProductFormSheet extends ConsumerStatefulWidget {
  const _ProductFormSheet({this.product});

  final ControlProduct? product;

  @override
  ConsumerState<_ProductFormSheet> createState() => _ProductFormSheetState();
}

class _ProductFormSheetState extends ConsumerState<_ProductFormSheet> {
  late final TextEditingController _name;
  late final TextEditingController _price;
  late final TextEditingController _description;
  late final TextEditingController _imageUrl;
  ImageFramingValues _framing = const ImageFramingValues();
  String? _businessId;
  String? _dishCategoryId;
  bool _isAvailable = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _name = TextEditingController(text: p?.name ?? '');
    _price = TextEditingController(
      text: p != null ? p.price.toString() : '',
    );
    _description = TextEditingController(text: p?.description ?? '');
    _imageUrl = TextEditingController(text: p?.imageUrl ?? '');
    _businessId = p?.businessId;
    _dishCategoryId = p?.dishCategoryId;
    _isAvailable = p?.isAvailable ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    _price.dispose();
    _description.dispose();
    _imageUrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final price = num.tryParse(_price.text.trim().replaceAll(',', '.'));
    final businessId = _businessId;
    final dishCategoryId = _dishCategoryId;
    if (name.length < 2) {
      showActionSnackBar(context, 'Nom kamida 2 belgi', error: true);
      return;
    }
    if (price == null || price < 0) {
      showActionSnackBar(context, 'Narx noto‘g‘ri', error: true);
      return;
    }
    if (businessId == null || businessId.isEmpty) {
      showActionSnackBar(context, 'Restoranni tanlang', error: true);
      return;
    }
    if (dishCategoryId == null || dishCategoryId.isEmpty) {
      showActionSnackBar(context, 'Kategoriyani tanlang', error: true);
      return;
    }

    setState(() => _busy = true);
    try {
      final repo = ref.read(catalogRepositoryProvider);
      final imageUrl = _imageUrl.text.trim();
      final desc = _description.text.trim();
      late ControlProduct saved;
      if (widget.product == null) {
        saved = await repo.createProduct(
          businessId: businessId,
          name: name,
          price: price,
          dishCategoryId: dishCategoryId,
          description: desc.isEmpty ? null : desc,
          isAvailable: _isAvailable,
        );
      } else {
        saved = await repo.updateProduct(
          widget.product!.id,
          name: name,
          price: price,
          description: desc,
          dishCategoryId: dishCategoryId,
          businessId: businessId,
          isAvailable: _isAvailable,
        );
      }
      if (imageUrl.isNotEmpty && imageUrl != (widget.product?.imageUrl ?? '')) {
        await repo.addProductImage(saved.id, url: imageUrl);
      }
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

  Future<void> _delete() async {
    final id = widget.product?.id;
    if (id == null) return;
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeleteProduct,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(catalogRepositoryProvider).deleteProduct(id);
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
    final businesses =
        ref.watch(_productBusinessesProvider).valueOrNull ?? const [];
    final categories = ref.watch(dishCategoriesProvider).valueOrNull ??
        const <ControlDishCategory>[];
    final activeCategories = categories.where((c) => c.isActive).toList();
    final businessValue =
        businesses.any((b) => b.id == _businessId) ? _businessId : null;
    final categoryValue = activeCategories.any((c) => c.id == _dishCategoryId)
        ? _dishCategoryId
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        DropdownButtonFormField<String>(
          value: businessValue,
          decoration:
              const InputDecoration(labelText: AppStrings.productBusiness),
          items: [
            for (final b in businesses)
              DropdownMenuItem(value: b.id, child: Text(b.name)),
          ],
          onChanged: _busy ? null : (v) => setState(() => _businessId = v),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: categoryValue,
          decoration:
              const InputDecoration(labelText: AppStrings.productCategory),
          items: [
            for (final c in activeCategories)
              DropdownMenuItem(value: c.id, child: Text(c.name)),
          ],
          onChanged: _busy ? null : (v) => setState(() => _dishCategoryId = v),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _name,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.productName),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _price,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: AppStrings.productPrice),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _description,
          enabled: !_busy,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: AppStrings.descriptionLabel,
          ),
        ),
        const SizedBox(height: 12),
        ImageUploadField(
          imageUrlController: _imageUrl,
          framing: _framing,
          onFramingChanged: (v) => setState(() => _framing = v),
          enabled: !_busy,
          aspectRatio: 1,
          refererPath: '/admin/products',
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(AppStrings.active),
          value: _isAvailable,
          onChanged: _busy ? null : (v) => setState(() => _isAvailable = v),
        ),
        MutationButton(
          label: AppStrings.save,
          loading: _busy,
          onPressed: _busy ? null : _save,
        ),
        if (widget.product != null) ...[
          const SizedBox(height: 8),
          MutationButton(
            label: AppStrings.softDeleteProduct,
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
