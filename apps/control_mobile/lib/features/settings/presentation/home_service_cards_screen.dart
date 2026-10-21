import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/home_service_image.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../data/home_service_card_model.dart';
import '../data/settings_model.dart';
import '../data/settings_repository.dart';
import 'settings_screen.dart';

class _TileMeta {
  const _TileMeta({
    required this.keyName,
    required this.title,
    required this.eta,
    required this.tileColor,
    this.badge,
    this.compact = false,
    this.wide = false,
  });

  final String keyName;
  final String title;
  final String eta;
  final Color tileColor;
  final String? badge;
  final bool compact;
  final bool wide;
}

const _topRow = <_TileMeta>[
  _TileMeta(
    keyName: 'flowers',
    title: 'Gullar',
    eta: '40 daq',
    tileColor: Colors.white,
    compact: true,
  ),
  _TileMeta(
    keyName: 'cosmetics',
    title: 'Kosmetika',
    eta: '45 daq',
    tileColor: Color(0xFFF4F4F5),
    compact: true,
  ),
  _TileMeta(
    keyName: 'pharmacy',
    title: 'Dorixona',
    eta: '35 daq',
    tileColor: Colors.white,
    compact: true,
  ),
];

const _restaurantsMeta = _TileMeta(
  keyName: 'restaurants',
  title: 'Restoranlar',
  eta: '25 daq',
  tileColor: Color(0xFFF4F4F5),
  badge: 'Tez',
  wide: true,
);

const _productsMeta = _TileMeta(
  keyName: 'products',
  title: 'Mahsulotlar',
  eta: '30 daq',
  tileColor: Colors.white,
);

class HomeServiceCardsScreen extends ConsumerStatefulWidget {
  const HomeServiceCardsScreen({super.key});

  @override
  ConsumerState<HomeServiceCardsScreen> createState() =>
      _HomeServiceCardsScreenState();
}

class _HomeServiceCardsScreenState
    extends ConsumerState<HomeServiceCardsScreen> {
  HomeServiceCards? _draft;
  final Map<String, TextEditingController> _urlControllers = {};
  bool _saving = false;
  String? _message;
  String _selectedKey = 'flowers';

  @override
  void dispose() {
    for (final c in _urlControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _ensureDraft(AdminSettings settings) {
    if (_draft != null) return;
    _draft = settings.homeServiceCards;
    for (final key in HomeServiceCards.keys) {
      final controller = TextEditingController(text: _draft![key].imageUrl);
      controller.addListener(() {
        final cards = _draft;
        if (cards == null || !mounted) return;
        final url = controller.text.trim();
        if (cards[key].imageUrl == url) return;
        setState(() {
          _draft = cards.copyWithKey(
            key,
            cards[key].copyWith(imageUrl: url),
          );
        });
      });
      _urlControllers[key] = controller;
    }
  }

  Future<void> _save(AdminSettings current) async {
    final draft = _draft;
    if (draft == null) return;
    setState(() {
      _saving = true;
      _message = null;
    });
    try {
      var cards = draft;
      for (final key in HomeServiceCards.keys) {
        final url = _urlControllers[key]?.text.trim() ?? '';
        cards = cards.copyWithKey(
          key,
          cards[key].copyWith(imageUrl: url),
        );
      }
      final updated = current.copyWith(homeServiceCards: cards);
      await ref.read(settingsRepositoryProvider).updateAdminSettings(updated);
      ref.invalidate(settingsProvider);
      if (mounted) {
        setState(() {
          _draft = cards;
          _message = AppStrings.saved;
        });
        showActionSnackBar(context, AppStrings.saved);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _message = ApiException.formatError(e));
        showActionError(context, e);
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _updateLayout(String key, HomeServiceCardLayout layout) {
    setState(() {
      _draft = (_draft ?? HomeServiceCards.defaults).copyWithKey(key, layout);
    });
  }

  _TileMeta get _selectedMeta {
    for (final m in _topRow) {
      if (m.keyName == _selectedKey) return m;
    }
    if (_selectedKey == 'products') return _productsMeta;
    return _restaurantsMeta;
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.homeServiceCardsTitle),
      ),
      body: AsyncPageBody<AdminSettings>(
        asyncValue: async,
        onRefresh: () => ref.refresh(settingsProvider.future),
        dataBuilder: (settings) {
          _ensureDraft(settings);
          final draft = _draft!;
          final selected = draft[_selectedKey];
          final meta = _selectedMeta;
          final urlController = _urlControllers[_selectedKey]!;

          return ListView(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.xxl,
            ),
            children: [
              const PageHeader(
                padded: false,
                title: AppStrings.homeServiceCardsTitle,
                subtitle: AppStrings.homeServiceCardsHint,
              ),
              if (_message != null) ...[
                const SizedBox(height: 8),
                Text(
                  _message!,
                  style: AppTypography.bodySmall.copyWith(
                    color: _message == AppStrings.saved
                        ? AppColors.success
                        : AppColors.danger,
                  ),
                ),
              ],
              const SizedBox(height: 14),
              Text(AppStrings.homeServiceLivePreview, style: AppTypography.subtitle),
              const SizedBox(height: 4),
              Text(
                AppStrings.homeServiceLivePreviewHint,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),
              _ProdLikeGrid(
                cards: draft,
                selectedKey: _selectedKey,
                onSelect: (key) => setState(() => _selectedKey = key),
              ),
              const SizedBox(height: 20),
              Text(
                '${AppStrings.edit}: ${meta.title}',
                style: AppTypography.subtitle,
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ImageUploadField(
                      imageUrlController: urlController,
                      refererPath: '/admin/home-services',
                      showSimplePreview: false,
                    ),
                    const SizedBox(height: 8),
                    _SliderRow(
                      label: AppStrings.homeServiceWidth,
                      value: HomeServiceCardLayout.clampWidth(
                        selected.widthPercent,
                      ),
                      min: 40,
                      max: 160,
                      onChanged: (v) => _updateLayout(
                        _selectedKey,
                        selected.copyWith(
                          widthPercent: HomeServiceCardLayout.clampWidth(v),
                        ),
                      ),
                    ),
                    _SliderRow(
                      label: AppStrings.homeServiceRight,
                      value: HomeServiceCardLayout.clampOffset(selected.right),
                      min: -80,
                      max: 40,
                      onChanged: (v) => _updateLayout(
                        _selectedKey,
                        selected.copyWith(
                          right: HomeServiceCardLayout.clampOffset(v),
                        ),
                      ),
                    ),
                    _SliderRow(
                      label: AppStrings.homeServiceBottom,
                      value: HomeServiceCardLayout.clampOffset(selected.bottom),
                      min: -80,
                      max: 40,
                      onChanged: (v) => _updateLayout(
                        _selectedKey,
                        selected.copyWith(
                          bottom: HomeServiceCardLayout.clampOffset(v),
                        ),
                      ),
                    ),
                    _SliderRow(
                      label: AppStrings.homeServiceRotate,
                      value: HomeServiceCardLayout.clampRotate(selected.rotate),
                      min: -30,
                      max: 30,
                      onChanged: (v) => _updateLayout(
                        _selectedKey,
                        selected.copyWith(
                          rotate: HomeServiceCardLayout.clampRotate(v),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              MutationButton(
                label: AppStrings.save,
                loading: _saving,
                onPressed: () => _save(settings),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Mirrors web `HomeServiceGrid`: 3 compact tiles, then restaurants + products.
class _ProdLikeGrid extends StatelessWidget {
  const _ProdLikeGrid({
    required this.cards,
    required this.selectedKey,
    required this.onSelect,
  });

  final HomeServiceCards cards;
  final String selectedKey;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            children: [
              for (var i = 0; i < _topRow.length; i++) ...[
                if (i > 0) const SizedBox(width: 10),
                Expanded(
                  child: _ProdTile(
                    meta: _topRow[i],
                    layout: cards[_topRow[i].keyName],
                    selected: selectedKey == _topRow[i].keyName,
                    height: 120,
                    onTap: () => onSelect(_topRow[i].keyName),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 165,
                child: _ProdTile(
                  meta: _restaurantsMeta,
                  layout: cards.restaurants,
                  selected: selectedKey == 'restaurants',
                  height: 132,
                  onTap: () => onSelect('restaurants'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 100,
                child: _ProdTile(
                  meta: _productsMeta,
                  layout: cards.products,
                  selected: selectedKey == 'products',
                  height: 132,
                  onTap: () => onSelect('products'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProdTile extends StatelessWidget {
  const _ProdTile({
    required this.meta,
    required this.layout,
    required this.selected,
    required this.height,
    required this.onTap,
  });

  final _TileMeta meta;
  final HomeServiceCardLayout layout;
  final bool selected;
  final double height;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hasImage = layout.imageUrl.trim().isNotEmpty;
    final titleMax = meta.compact ? 0.78 : 0.62;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(26),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: height,
          decoration: BoxDecoration(
            color: meta.tileColor,
            borderRadius: BorderRadius.circular(26),
            border: Border.all(
              color: selected ? AppColors.primary : const Color(0x0A000000),
              width: selected ? 2 : 1,
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0A0F172A),
                blurRadius: 12,
                offset: Offset(0, 2),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final imgW = constraints.maxWidth *
                  (layout.widthPercent / 100).clamp(0.4, 1.6);
              return Stack(
                children: [
                  if (hasImage)
                    Positioned(
                      right: layout.right,
                      bottom: layout.bottom,
                      width: imgW,
                      child: Transform.rotate(
                        angle: layout.rotate * math.pi / 180,
                        child: buildHomeServiceImage(
                          url: layout.imageUrl,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  Padding(
                    padding: EdgeInsets.all(meta.compact ? 12 : 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        FractionallySizedBox(
                          widthFactor: titleMax,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                meta.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: meta.compact ? 12.5 : 14,
                                  fontWeight: FontWeight.w700,
                                  height: 1.15,
                                  color: const Color(0xFF18181B),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                meta.eta,
                                style: TextStyle(
                                  fontSize: meta.compact ? 11 : 12,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFFA1A1AA),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                        if (meta.badge != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF18181B),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              meta.badge!,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  final String label;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: AppTypography.bodySmall)),
            Text(
              value.round().toString(),
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          divisions: (max - min).round(),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
