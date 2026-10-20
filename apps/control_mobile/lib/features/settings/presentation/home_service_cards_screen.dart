import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/media_url.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../data/home_service_card_model.dart';
import '../data/settings_model.dart';
import '../data/settings_repository.dart';
import 'settings_screen.dart';

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

  static const _labels = <String, String>{
    'flowers': 'Gullar',
    'cosmetics': 'Kosmetika',
    'pharmacy': 'Dorixona',
    'restaurants': 'Restoranlar',
    'products': 'Mahsulotlar',
  };

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
              const SizedBox(height: 12),
              for (final key in HomeServiceCards.keys) ...[
                _CardEditor(
                  title: _labels[key] ?? key,
                  previewWidth: key == 'restaurants'
                      ? 220
                      : key == 'products'
                          ? 140
                          : 118,
                  previewHeight:
                      key == 'restaurants' || key == 'products' ? 132 : 120,
                  layout: draft[key],
                  urlController: _urlControllers[key]!,
                  onChanged: (layout) => _updateLayout(key, layout),
                ),
                const SizedBox(height: 14),
              ],
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

class _CardEditor extends StatelessWidget {
  const _CardEditor({
    required this.title,
    required this.previewWidth,
    required this.previewHeight,
    required this.layout,
    required this.urlController,
    required this.onChanged,
  });

  final String title;
  final double previewWidth;
  final double previewHeight;
  final HomeServiceCardLayout layout;
  final TextEditingController urlController;
  final ValueChanged<HomeServiceCardLayout> onChanged;

  @override
  Widget build(BuildContext context) {
    final previewH = previewHeight;
    final previewW = previewWidth;
    final resolved = resolveMediaUrl(layout.imageUrl);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: AppTypography.subtitle),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              width: previewW,
              height: previewH,
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F5),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0x0A000000)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  Positioned(
                    left: 10,
                    top: 10,
                    right: previewW * 0.35,
                    child: Text(
                      title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF18181B),
                      ),
                    ),
                  ),
                  if (resolved.isNotEmpty)
                    Positioned(
                      right: layout.right,
                      bottom: layout.bottom,
                      width: previewW * (layout.widthPercent / 100),
                      child: Transform.rotate(
                        angle: layout.rotate * math.pi / 180,
                        child: Image.network(
                          resolved,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) =>
                              const SizedBox.shrink(),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          ImageUploadField(
            imageUrlController: urlController,
            refererPath: '/admin/home-services',
          ),
          const SizedBox(height: 8),
          _SliderRow(
            label: AppStrings.homeServiceWidth,
            value: HomeServiceCardLayout.clampWidth(layout.widthPercent),
            min: 40,
            max: 160,
            onChanged: (v) => onChanged(
              layout.copyWith(
                widthPercent: HomeServiceCardLayout.clampWidth(v),
              ),
            ),
          ),
          _SliderRow(
            label: AppStrings.homeServiceRight,
            value: HomeServiceCardLayout.clampOffset(layout.right),
            min: -80,
            max: 40,
            onChanged: (v) => onChanged(
              layout.copyWith(right: HomeServiceCardLayout.clampOffset(v)),
            ),
          ),
          _SliderRow(
            label: AppStrings.homeServiceBottom,
            value: HomeServiceCardLayout.clampOffset(layout.bottom),
            min: -80,
            max: 40,
            onChanged: (v) => onChanged(
              layout.copyWith(bottom: HomeServiceCardLayout.clampOffset(v)),
            ),
          ),
          _SliderRow(
            label: AppStrings.homeServiceRotate,
            value: HomeServiceCardLayout.clampRotate(layout.rotate),
            min: -30,
            max: 30,
            onChanged: (v) => onChanged(
              layout.copyWith(rotate: HomeServiceCardLayout.clampRotate(v)),
            ),
          ),
        ],
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
