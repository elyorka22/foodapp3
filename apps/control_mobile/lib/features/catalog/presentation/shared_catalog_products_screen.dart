import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/media_url.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../shell/control_vertical_scope.dart';
import '../data/catalog_repository.dart';
import '../data/product_category_model.dart';
import '../data/product_model.dart';

final _sharedCatalogProductsProvider =
    FutureProvider.autoDispose<List<ControlProduct>>((ref) async {
  final scope = ref.watch(controlVerticalScopeProvider);
  if (!scope.usesSharedCatalog) return const <ControlProduct>[];
  final page = await ref.watch(catalogRepositoryProvider).fetchSharedProducts(
        typeSlug: scope.slug,
        businessTypeId: scope.id,
        limit: 100,
      );
  return page.data;
});

final _sharedCatalogCategoriesProvider =
    FutureProvider.autoDispose<List<ControlProductCategory>>((ref) async {
  final scope = ref.watch(controlVerticalScopeProvider);
  if (!scope.usesSharedCatalog) return const <ControlProductCategory>[];
  return ref.watch(catalogRepositoryProvider).fetchProductCategories(
        businessTypeId: scope.id,
        typeSlug: scope.slug,
      );
});

class SharedCatalogProductsScreen extends ConsumerWidget {
  const SharedCatalogProductsScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scope = ref.watch(controlVerticalScopeProvider);
    final async = ref.watch(_sharedCatalogProductsProvider);
    final title = scope.name != null && scope.name!.isNotEmpty
        ? '${scope.name} · ${AppStrings.sharedCatalogTitle}'
        : AppStrings.sharedCatalogTitle;
    final canManage = scope.usesSharedCatalog &&
        ((scope.id != null && scope.id!.isNotEmpty) ||
            (scope.slug != null && scope.slug!.isNotEmpty));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!embedded)
          PageHeader(
            title: title,
            trailing: canManage
                ? HeaderAction(
                    label: AppStrings.create,
                    onPressed: () => showDetailSheet(
                      context: context,
                      title: AppStrings.addSharedProduct,
                      initialChildSize: 0.92,
                      builder: (_) => _SharedProductFormSheet(
                        businessTypeId: scope.id,
                        typeSlug: scope.slug,
                      ),
                    ),
                  )
                : null,
          )
        else
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.sm,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: AppTypography.title),
                      const SizedBox(height: 2),
                      Text(
                        canManage
                            ? AppStrings.sharedCatalogHint
                            : AppStrings.sharedCatalogNeedType,
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ),
                if (canManage)
                  HeaderAction(
                    label: AppStrings.create,
                    onPressed: () => showDetailSheet(
                      context: context,
                      title: AppStrings.addSharedProduct,
                      initialChildSize: 0.92,
                      builder: (_) => _SharedProductFormSheet(
                        businessTypeId: scope.id,
                        typeSlug: scope.slug,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        Expanded(
          child: !canManage
              ? const Center(child: Text(AppStrings.sharedCatalogNeedType))
              : AsyncPageBody<List<ControlProduct>>(
                  asyncValue: async,
                  onRefresh: () =>
                      ref.refresh(_sharedCatalogProductsProvider.future),
                  isEmpty: (list) => list.isEmpty,
                  emptyMessage: AppStrings.sharedCatalogEmpty,
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.sm,
                    AppSpacing.lg,
                    AppSpacing.lg,
                  ),
                  dataBuilder: (list) => ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 6),
                    itemBuilder: (context, i) {
                      final p = list[i];
                      final price = p.defaultPrice ?? p.price;
                      return ControlListCard(
                        leading: _ProductThumb(url: p.imageUrl),
                        title: p.name,
                        subtitle: [
                          if (p.categoryName != null &&
                              p.categoryName!.isNotEmpty)
                            p.categoryName!,
                          '${_formatPrice(price)} UZS',
                        ].join(' · '),
                        trailing: StatusChip(
                          status: p.isAvailable ? 'DELIVERED' : 'CANCELLED',
                          label: p.isAvailable
                              ? AppStrings.active
                              : AppStrings.inactive,
                        ),
                        onTap: () => showDetailSheet(
                          context: context,
                          title: AppStrings.edit,
                          initialChildSize: 0.92,
                          builder: (_) => _SharedProductFormSheet(
                            businessTypeId: scope.id,
                            typeSlug: scope.slug,
                            product: p,
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }
}

class _ProductThumb extends StatelessWidget {
  const _ProductThumb({this.url});
  final String? url;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(url);
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 44,
        height: 44,
        child: resolved.isEmpty
            ? const ColoredBox(
                color: Color(0xFFE4E4E7),
                child: Icon(Icons.inventory_2_outlined, size: 20),
              )
            : Image.network(
                resolved,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const ColoredBox(
                  color: Color(0xFFE4E4E7),
                  child: Icon(Icons.broken_image_outlined, size: 20),
                ),
              ),
      ),
    );
  }
}

String _formatPrice(num value) {
  final n = value.round();
  final s = n.toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    final fromEnd = s.length - i;
    buf.write(s[i]);
    if (fromEnd > 1 && fromEnd % 3 == 1) buf.write(' ');
  }
  return buf.toString();
}

class _SharedProductFormSheet extends ConsumerStatefulWidget {
  const _SharedProductFormSheet({
    this.businessTypeId,
    this.typeSlug,
    this.product,
  });

  final String? businessTypeId;
  final String? typeSlug;
  final ControlProduct? product;

  @override
  ConsumerState<_SharedProductFormSheet> createState() =>
      _SharedProductFormSheetState();
}

class _SharedProductFormSheetState
    extends ConsumerState<_SharedProductFormSheet> {
  late final TextEditingController _name;
  late final TextEditingController _description;
  late final TextEditingController _defaultPrice;
  late final TextEditingController _imageUrl;
  String? _categoryId;
  bool _isAvailable = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _name = TextEditingController(text: p?.name ?? '');
    _description = TextEditingController(text: p?.description ?? '');
    final price = p?.defaultPrice ?? p?.price;
    _defaultPrice = TextEditingController(
      text: price != null ? '$price' : '',
    );
    _imageUrl = TextEditingController(text: p?.imageUrl ?? '');
    _categoryId = p?.productCategoryId;
    _isAvailable = p?.isAvailable ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _defaultPrice.dispose();
    _imageUrl.dispose();
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
      final price = num.tryParse(
            _defaultPrice.text.trim().replaceAll(' ', ''),
          ) ??
          0;
      final imageUrl = _imageUrl.text.trim();
      late ControlProduct saved;
      if (widget.product == null) {
        saved = await repo.createSharedProduct(
          typeSlug: widget.typeSlug,
          businessTypeId: widget.businessTypeId,
          productCategoryId: _categoryId,
          name: name,
          description: _description.text.trim(),
          defaultPrice: price,
          price: price,
          isAvailable: _isAvailable,
        );
      } else {
        saved = await repo.updateSharedProduct(
          widget.product!.id,
          name: name,
          description: _description.text.trim(),
          productCategoryId: _categoryId,
          defaultPrice: price,
          price: price,
          isAvailable: _isAvailable,
        );
      }
      if (imageUrl.isNotEmpty && imageUrl != (widget.product?.imageUrl ?? '')) {
        await repo.addProductImage(saved.id, url: imageUrl);
      }
      ref.invalidate(_sharedCatalogProductsProvider);
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
      await ref.read(catalogRepositoryProvider).deleteSharedProduct(id);
      ref.invalidate(_sharedCatalogProductsProvider);
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
    final catsAsync = ref.watch(_sharedCatalogCategoriesProvider);
    final categories = catsAsync.valueOrNull ?? const <ControlProductCategory>[];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.nameLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _description,
          enabled: !_busy,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: AppStrings.descriptionLabel,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _defaultPrice,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: AppStrings.defaultPriceLabel,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: categories.any((c) => c.id == _categoryId)
              ? _categoryId
              : '',
          decoration: const InputDecoration(
            labelText: AppStrings.navStoreCategories,
          ),
          items: [
            const DropdownMenuItem<String>(
              value: '',
              child: Text('—'),
            ),
            for (final c in categories)
              DropdownMenuItem(value: c.id, child: Text(c.name)),
          ],
          onChanged: _busy
              ? null
              : (v) => setState(
                    () => _categoryId =
                        (v == null || v.isEmpty) ? null : v,
                  ),
        ),
        const SizedBox(height: 12),
        ImageUploadField(
          imageUrlController: _imageUrl,
          enabled: !_busy,
          refererPath: '/admin/stores/products',
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
          onPressed: _save,
        ),
        if (widget.product != null) ...[
          const SizedBox(height: 8),
          MutationButton(
            label: AppStrings.delete,
            filled: false,
            destructive: true,
            loading: _busy,
            onPressed: _delete,
          ),
        ],
      ],
    );
  }
}
