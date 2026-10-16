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
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/banner_model.dart';
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

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              0,
            ),
            child:
                Text(AppStrings.promotionsTitle, style: AppTypography.display),
          ),
          Expanded(
            child: AsyncPageBody<_PromotionsBundle>(
              asyncValue: async,
              onRefresh: () => ref.refresh(promotionsProvider.future),
              isEmpty: (b) => b.banners.isEmpty && b.promos.isEmpty,
              emptyMessage: AppStrings.emptyList,
              padding: const EdgeInsets.all(AppSpacing.lg),
              dataBuilder: (bundle) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            AppStrings.bannersSection,
                            style: AppTypography.subtitle,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () => showDetailSheet(
                            context: context,
                            title: AppStrings.addBanner,
                            builder: (_) => const _BannerFormSheet(),
                          ),
                          icon: const Icon(Icons.add),
                          label: const Text(AppStrings.addBanner),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (bundle.banners.isEmpty)
                      Text(AppStrings.emptyList, style: AppTypography.bodySmall)
                    else
                      ...bundle.banners.map((b) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: ControlListCard(
                            title: b.title.isNotEmpty
                                ? b.title
                                : (b.placement.isNotEmpty ? b.placement : b.id),
                            subtitle: [
                              if (b.placement.isNotEmpty) b.placement,
                              if (b.linkUrl != null) b.linkUrl!,
                            ].join(' · '),
                            trailing: StatusChip(
                              status: b.isActive ? 'DELIVERED' : 'CANCELLED',
                              label: b.isActive
                                  ? AppStrings.active
                                  : AppStrings.inactive,
                            ),
                            onTap: () => showDetailSheet(
                              context: context,
                              title: AppStrings.details,
                              builder: (_) => _BannerFormSheet(banner: b),
                            ),
                          ),
                        );
                      }),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            AppStrings.promosSection,
                            style: AppTypography.subtitle,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () => showDetailSheet(
                            context: context,
                            title: AppStrings.addPromo,
                            builder: (_) => const _PromoFormSheet(),
                          ),
                          icon: const Icon(Icons.add),
                          label: const Text(AppStrings.addPromo),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (bundle.promos.isEmpty)
                      Text(AppStrings.emptyList, style: AppTypography.bodySmall)
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
                              status: p.isActive ? 'DELIVERED' : 'CANCELLED',
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
                );
              },
            ),
          ),
        ],
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
  late final TextEditingController _imageUrl;
  late final TextEditingController _link;
  String _placement = 'HERO';
  bool _isActive = true;
  bool _busy = false;

  static const _placements = [
    'HERO',
    'PROMO',
    'HOME_MAIN',
    'HOME_SIDE_TOP',
    'HOME_SIDE_BOTTOM',
  ];

  @override
  void initState() {
    super.initState();
    final b = widget.banner;
    _title = TextEditingController(text: b?.title ?? '');
    _imageUrl = TextEditingController(text: b?.imageUrl ?? '');
    _link = TextEditingController(text: b?.linkUrl ?? '');
    _placement = b?.placement.isNotEmpty == true ? b!.placement : 'HERO';
    _isActive = b?.isActive ?? true;
  }

  @override
  void dispose() {
    _title.dispose();
    _imageUrl.dispose();
    _link.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final imageUrl = _imageUrl.text.trim();
    if (imageUrl.isEmpty) {
      showActionSnackBar(context, 'Rasm URL majburiy', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(promotionsRepositoryProvider);
      if (widget.banner == null) {
        await repo.createBanner(
          imageUrl: imageUrl,
          title: _title.text.trim(),
          link: _link.text.trim(),
          placement: _placement,
          isActive: _isActive,
        );
      } else {
        await repo.updateBanner(
          widget.banner!.id,
          title: _title.text.trim(),
          imageUrl: imageUrl,
          link: _link.text.trim(),
          placement: _placement,
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
        TextField(
          controller: _title,
          decoration: const InputDecoration(labelText: AppStrings.bannerTitle),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _imageUrl,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerImageUrl),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _link,
          decoration: const InputDecoration(labelText: AppStrings.bannerLink),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _placement,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerPlacement),
          items: [
            for (final p in _placements)
              DropdownMenuItem(value: p, child: Text(p)),
          ],
          onChanged:
              _busy ? null : (v) => setState(() => _placement = v ?? _placement),
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
        if (widget.banner != null) ...[
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
