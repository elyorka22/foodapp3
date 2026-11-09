import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/image_framing_controls.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../shell/control_vertical_scope.dart';
import '../data/catalog_repository.dart';
import '../data/product_category_model.dart';

final _storeCategoriesProvider =
    FutureProvider.autoDispose<List<ControlProductCategory>>((ref) async {
  final scope = ref.watch(controlVerticalScopeProvider);
  if (!scope.isScoped || scope.isRestaurant) return [];
  return ref.watch(catalogRepositoryProvider).fetchProductCategories(
        businessTypeId: scope.id,
        typeSlug: scope.slug,
      );
});

String _slugFromName(String name) {
  final lower = name.trim().toLowerCase();
  final buf = StringBuffer();
  var dash = false;
  for (final rune in lower.runes) {
    final ch = String.fromCharCode(rune);
    final ok = RegExp(r'[a-z0-9а-яёўқғҳ]').hasMatch(ch);
    if (ok) {
      buf.write(ch);
      dash = false;
    } else if (!dash && buf.isNotEmpty) {
      buf.write('-');
      dash = true;
    }
  }
  var slug = buf.toString().replaceAll(RegExp(r'-+$'), '');
  if (slug.length < 2) {
    slug = 'cat-${DateTime.now().millisecondsSinceEpoch}';
  }
  return slug;
}

class StoreCategoriesScreen extends ConsumerWidget {
  const StoreCategoriesScreen({super.key, this.embedded = false});

  /// When true, omit Scaffold (used inside the control shell).
  final bool embedded;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scope = ref.watch(controlVerticalScopeProvider);
    final catsAsync = ref.watch(_storeCategoriesProvider);
    final canManage = scope.isScoped && !scope.isRestaurant;
    final title = scope.isScoped && (scope.name?.isNotEmpty ?? false)
        ? '${scope.name} · ${AppStrings.storeCategoriesSection}'
        : AppStrings.storeCategoriesSection;

    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: title,
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              HeaderAction(
                label: AppStrings.addCategory,
                onPressed: !canManage
                    ? null
                    : () => showDetailSheet(
                          context: context,
                          title: AppStrings.addCategory,
                          initialChildSize: 0.92,
                          builder: (_) => _StoreCategoryFormSheet(
                            businessTypeId: scope.id,
                            typeSlug: scope.slug,
                          ),
                        ),
              ),
              if (!embedded)
                IconButton(
                  tooltip: AppStrings.cancel,
                  onPressed: () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.close),
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            8,
          ),
          child: Text(
            canManage
                ? AppStrings.storeCategoriesHint
                : AppStrings.storeCategoriesNeedType,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Expanded(
          child: !canManage
              ? const Center(child: Text(AppStrings.storeCategoriesNeedType))
              : AsyncPageBody<List<ControlProductCategory>>(
                  asyncValue: catsAsync,
                  onRefresh: () =>
                      ref.refresh(_storeCategoriesProvider.future),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  dataBuilder: (categories) {
                    final rows = [...categories]
                      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
                    if (rows.isEmpty) {
                      return Text(
                        AppStrings.storeCategoriesEmpty,
                        style: AppTypography.bodySmall,
                      );
                    }
                    return Column(
                      children: [
                        for (final c in rows)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: ControlListCard(
                              leading: _Thumb(url: c.imageUrl),
                              title: c.name,
                              subtitle: c.slug.isNotEmpty ? c.slug : null,
                              trailing: StatusChip(
                                status:
                                    c.isActive ? 'DELIVERED' : 'CANCELLED',
                                label: c.isActive
                                    ? AppStrings.active
                                    : AppStrings.inactive,
                              ),
                              onTap: () => showDetailSheet(
                                context: context,
                                title: AppStrings.editCategory,
                                initialChildSize: 0.92,
                                builder: (_) => _StoreCategoryFormSheet(
                                  businessTypeId: scope.id,
                                  typeSlug: scope.slug,
                                  category: c,
                                ),
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );

    if (embedded) return body;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(child: body),
    );
  }
}

class _Thumb extends StatelessWidget {
  const _Thumb({this.url});

  final String? url;

  @override
  Widget build(BuildContext context) {
    final trimmed = url?.trim() ?? '';
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        width: 48,
        height: 48,
        child: trimmed.isEmpty
            ? const ColoredBox(
                color: Color(0xFFE4E4E7),
                child: Icon(Icons.category_outlined, size: 22),
              )
            : Image.network(
                trimmed,
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

class _StoreCategoryFormSheet extends ConsumerStatefulWidget {
  const _StoreCategoryFormSheet({
    this.businessTypeId,
    this.typeSlug,
    this.category,
  });

  final String? businessTypeId;
  final String? typeSlug;
  final ControlProductCategory? category;

  @override
  ConsumerState<_StoreCategoryFormSheet> createState() =>
      _StoreCategoryFormSheetState();
}

class _StoreCategoryFormSheetState
    extends ConsumerState<_StoreCategoryFormSheet> {
  late final TextEditingController _name;
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
    _imageUrl = TextEditingController(text: c?.imageUrl ?? '');
    _sortOrder = TextEditingController(text: '${c?.sortOrder ?? 0}');
    _framing = ImageFramingValues(
      imageScale: c?.imageScale ?? 100,
      imagePositionX: c?.imagePositionX ?? 50,
      imagePositionY: c?.imagePositionY ?? 50,
    );
    _isActive = c?.isActive ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
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
      if (widget.category == null) {
        await repo.createProductCategory(
          businessTypeId: widget.businessTypeId,
          typeSlug: widget.typeSlug,
          name: name,
          slug: _slugFromName(name),
          imageUrl: imageUrl.isEmpty ? null : imageUrl,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
          sortOrder: sortOrder,
        );
      } else {
        await repo.updateProductCategory(
          widget.category!.id,
          name: name,
          imageUrl: imageUrl,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
          sortOrder: sortOrder,
          isActive: _isActive,
        );
      }
      ref.invalidate(_storeCategoriesProvider);
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
      await ref.read(catalogRepositoryProvider).deleteProductCategory(id);
      ref.invalidate(_storeCategoriesProvider);
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
        const SizedBox(height: 12),
        ImageUploadField(
          imageUrlController: _imageUrl,
          enabled: !_busy,
          refererPath: '/admin/stores/categories',
          enableFraming: true,
          framing: _framing,
          onFramingChanged: (v) => setState(() => _framing = v),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _sortOrder,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerSortOrder),
        ),
        if (widget.category != null)
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
