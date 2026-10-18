import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
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
import '../../../shared/widgets/section_panel.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/banner_model.dart';
import '../data/banner_placement.dart';
import '../data/promo_model.dart';
import '../data/promotions_repository.dart';

class _PromotionsBundle {
  const _PromotionsBundle({
    required this.banners,
    required this.promos,
  });

  final List<ControlBanner> banners;
  final List<ControlPromoCode> promos;
}

final promotionsProvider =
    FutureProvider.autoDispose<_PromotionsBundle>((ref) async {
  final repo = ref.watch(promotionsRepositoryProvider);
  final banners = await repo.fetchBannersAdmin();
  final promos = await repo.fetchPromoCodes();
  return _PromotionsBundle(banners: banners, promos: promos);
});

class PromotionsScreen extends ConsumerWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(promotionsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.promotionsTitle,
          trailing: HeaderAction(
            label: AppStrings.addBanner,
            icon: Icons.add_photo_alternate_outlined,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addBanner,
              initialChildSize: 0.92,
              builder: (_) => const _BannerFormSheet(),
            ),
          ),
        ),
        Expanded(
          child: AsyncPageBody<_PromotionsBundle>(
            asyncValue: async,
            onRefresh: () => ref.refresh(promotionsProvider.future),
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            dataBuilder: (bundle) {
              final banners = [...bundle.banners]
                ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SectionPanel(
                    title: AppStrings.bannersSection,
                    subtitle: banners.isEmpty
                        ? AppStrings.bannerEmptyHint
                        : AppStrings.bannersHomeHint,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (banners.isNotEmpty) ...[
                          ReorderableListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: banners.length,
                            onReorder: (oldIndex, newIndex) async {
                              if (newIndex > oldIndex) newIndex -= 1;
                              final next = [...banners];
                              final item = next.removeAt(oldIndex);
                              next.insert(newIndex, item);
                              try {
                                await ref
                                    .read(promotionsRepositoryProvider)
                                    .reorderBanners(
                                      next.map((e) => e.id).toList(),
                                    );
                                ref.invalidate(promotionsProvider);
                              } catch (e) {
                                if (context.mounted) {
                                  showActionError(context, e);
                                }
                              }
                            },
                            itemBuilder: (context, index) {
                              final b = banners[index];
                              final surface =
                                  BannerPlacement.labelUz(b.placement);
                              return Padding(
                                key: ValueKey(b.id),
                                padding: const EdgeInsets.only(bottom: 8),
                                child: ControlListCard(
                                  leading: _BannerThumb(banner: b),
                                  title: b.title.isNotEmpty
                                      ? b.title
                                      : surface,
                                  subtitle: [
                                    surface,
                                    if (b.linkUrl != null &&
                                        b.linkUrl!.isNotEmpty)
                                      b.linkUrl!,
                                  ].join(' · '),
                                  trailing: StatusChip(
                                    status: b.isActive
                                        ? 'DELIVERED'
                                        : 'CANCELLED',
                                    label: b.isActive
                                        ? AppStrings.active
                                        : AppStrings.inactive,
                                  ),
                                  onTap: () => showDetailSheet(
                                    context: context,
                                    title: AppStrings.details,
                                    builder: (_) =>
                                        _BannerFormSheet(banner: b),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SectionPanel(
                    title: AppStrings.promosSection,
                    trailing: HeaderAction(
                      label: AppStrings.create,
                      onPressed: () => showDetailSheet(
                        context: context,
                        title: AppStrings.addPromo,
                        builder: (_) => const _PromoFormSheet(),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (bundle.promos.isEmpty)
                          Text(
                            AppStrings.emptyList,
                            style: AppTypography.bodySmall,
                          )
                        else
                          ...bundle.promos.map((p) {
                            final valueLabel =
                                p.type.toUpperCase().contains('PERCENT')
                                    ? '${p.value}%'
                                    : formatMoney(p.value);
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: ControlListCard(
                                title: p.code,
                                subtitle: [
                                  valueLabel,
                                  'ishlatilgan: ${p.usageCount}',
                                  if (p.expiresAt != null)
                                    'tugash: ${formatDateTime(p.expiresAt)}',
                                ].join(' · '),
                                trailing: StatusChip(
                                  status: p.isActive
                                      ? 'DELIVERED'
                                      : 'CANCELLED',
                                  label: p.isActive
                                      ? AppStrings.active
                                      : AppStrings.inactive,
                                ),
                                onTap: () => showDetailSheet(
                                  context: context,
                                  title: AppStrings.details,
                                  builder: (_) => _PromoFormSheet(promo: p),
                                ),
                              ),
                            );
                          }),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

class _BannerThumb extends StatelessWidget {
  const _BannerThumb({required this.banner});

  final ControlBanner banner;

  @override
  Widget build(BuildContext context) {
    final url = banner.imageUrl.trim();
    final framing = banner.framing;
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: SizedBox(
        width: 64,
        height: 44,
        child: url.isEmpty
            ? const ColoredBox(
                color: Color(0xFFE4E4E7),
                child: Icon(Icons.image_outlined, size: 20),
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

class _PromoFormSheet extends ConsumerStatefulWidget {
  const _PromoFormSheet({this.promo});

  final ControlPromoCode? promo;

  @override
  ConsumerState<_PromoFormSheet> createState() => _PromoFormSheetState();
}

class _PromoFormSheetState extends ConsumerState<_PromoFormSheet> {
  late final TextEditingController _code;
  late final TextEditingController _value;
  String _type = 'PERCENTAGE';
  bool _isActive = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final p = widget.promo;
    _code = TextEditingController(text: p?.code ?? '');
    _value = TextEditingController(text: p != null ? '${p.value}' : '');
    _type = p?.type.isNotEmpty == true ? p!.type : 'PERCENTAGE';
    _isActive = p?.isActive ?? true;
  }

  @override
  void dispose() {
    _code.dispose();
    _value.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final code = _code.text.trim();
    final value = num.tryParse(_value.text.trim());
    if (code.isEmpty || value == null) {
      showActionSnackBar(context, 'Kod va qiymat majburiy', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(promotionsRepositoryProvider);
      if (widget.promo == null) {
        await repo.createPromoCode(
          code: code,
          type: _type,
          value: value,
          isActive: _isActive,
        );
      } else {
        await repo.updatePromoCode(
          widget.promo!.id,
          code: code,
          type: _type,
          value: value,
          isActive: _isActive,
        );
      }
      ref.invalidate(promotionsProvider);
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
    final id = widget.promo?.id;
    if (id == null) return;
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeletePromo,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(promotionsRepositoryProvider).deletePromoCode(id);
      ref.invalidate(promotionsProvider);
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
          controller: _code,
          decoration: const InputDecoration(labelText: AppStrings.promoCode),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _type,
          decoration: const InputDecoration(labelText: AppStrings.promoType),
          items: const [
            DropdownMenuItem(value: 'PERCENTAGE', child: Text('PERCENTAGE')),
            DropdownMenuItem(value: 'FIXED', child: Text('FIXED')),
          ],
          onChanged: _busy ? null : (v) => setState(() => _type = v ?? _type),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _value,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: AppStrings.promoValue),
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
          onPressed: _save,
        ),
        if (widget.promo != null) ...[
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

class _BannerFormSheet extends ConsumerStatefulWidget {
  const _BannerFormSheet({this.banner});

  final ControlBanner? banner;

  @override
  ConsumerState<_BannerFormSheet> createState() => _BannerFormSheetState();
}

class _BannerFormSheetState extends ConsumerState<_BannerFormSheet> {
  late final TextEditingController _title;
  late final TextEditingController _description;
  late final TextEditingController _imageUrl;
  late final TextEditingController _link;
  late final TextEditingController _sortOrder;
  bool _isActive = true;
  bool _busy = false;
  late ImageFramingValues _framing;

  /// New home carousel aspect (~85% width × 150px).
  static const _previewAspect = 2.3;

  @override
  void initState() {
    super.initState();
    final b = widget.banner;
    _title = TextEditingController(text: b?.title ?? '');
    _description = TextEditingController(text: b?.description ?? '');
    _imageUrl = TextEditingController(text: b?.imageUrl ?? '');
    _link = TextEditingController(text: b?.linkUrl ?? '');
    _sortOrder = TextEditingController(text: '${b?.sortOrder ?? 0}');
    _isActive = b?.isActive ?? true;
    _framing = b?.framing ?? const ImageFramingValues();
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _imageUrl.dispose();
    _link.dispose();
    _sortOrder.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final imageUrl = _imageUrl.text.trim();
    if (imageUrl.isEmpty) {
      showActionSnackBar(context, AppStrings.bannerImageRequired, error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(promotionsRepositoryProvider);
      final sortOrder = int.tryParse(_sortOrder.text.trim()) ?? 0;
      final desc = _description.text.trim();
      // Always write canonical placement for the new home design.
      final placement = BannerPlacement.canonicalHome;
      if (widget.banner == null) {
        await repo.createBanner(
          imageUrl: imageUrl,
          title: _title.text.trim(),
          description: desc.isEmpty ? null : desc,
          link: _link.text.trim(),
          placement: placement,
          sortOrder: sortOrder,
          isActive: _isActive,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
        );
      } else {
        await repo.updateBanner(
          widget.banner!.id,
          title: _title.text.trim(),
          description: desc,
          imageUrl: imageUrl,
          link: _link.text.trim(),
          placement: placement,
          sortOrder: sortOrder,
          isActive: _isActive,
          imageScale: _framing.imageScale,
          imagePositionX: _framing.imagePositionX,
          imagePositionY: _framing.imagePositionY,
        );
      }
      ref.invalidate(promotionsProvider);
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
    final id = widget.banner?.id;
    if (id == null) return;
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeleteBanner,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(promotionsRepositoryProvider).deleteBanner(id);
      ref.invalidate(promotionsProvider);
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
        InputDecorator(
          decoration: const InputDecoration(
            labelText: AppStrings.bannerSurfaceLabel,
            border: OutlineInputBorder(),
          ),
          child: Text(
            AppStrings.bannerSurfaceHomeOffers,
            style: AppTypography.body,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _title,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.bannerTitle),
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
          aspectRatio: _previewAspect,
          refererPath: '/admin/banners',
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _link,
          enabled: !_busy,
          decoration: const InputDecoration(
            labelText: AppStrings.bannerLink,
            hintText: AppStrings.bannerLinkHint,
          ),
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
        if (widget.banner != null) ...[
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
