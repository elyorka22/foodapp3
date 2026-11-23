import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class ImageFramingValues {
  const ImageFramingValues({
    this.imageScale = 100,
    this.imagePositionX = 50,
    this.imagePositionY = 50,
  });

  final int imageScale;
  final int imagePositionX;
  final int imagePositionY;

  ImageFramingValues copyWith({
    int? imageScale,
    int? imagePositionX,
    int? imagePositionY,
  }) {
    return ImageFramingValues(
      imageScale: imageScale ?? this.imageScale,
      imagePositionX: imagePositionX ?? this.imagePositionX,
      imagePositionY: imagePositionY ?? this.imagePositionY,
    );
  }

  /// Zoom-in only (100–200%). Below 100% shrunk the bitmap and left sharp
  /// corners inside the rounded banner preview.
  static int clampScale(int? v) => (v ?? 100).clamp(100, 200);
  static int clampPos(int? v) => (v ?? 50).clamp(0, 100);
}

/// Which live UI surface the framing preview should match.
enum ImageFramingPreviewKind {
  /// Home banner strip: full width, about 7:2, radius 24.
  homeBanner,

  /// Store category tile: 3-col square ~1:1.05, radius 20.
  storeCategoryTile,
}

/// Preview + sliders. Pass [previewKind] so the box matches production.
class ImageFramingControls extends StatelessWidget {
  const ImageFramingControls({
    super.key,
    required this.imageUrl,
    required this.values,
    required this.onChanged,
    this.enabled = true,
    this.previewKind = ImageFramingPreviewKind.homeBanner,
  });

  final String? imageUrl;
  final ImageFramingValues values;
  final ValueChanged<ImageFramingValues> onChanged;
  final bool enabled;
  final ImageFramingPreviewKind previewKind;

  static const double homeBannerRadius = 24;

  /// Matches web/mobile store category tile: `rounded-[20px] aspect-[1/1.05]`.
  static const double storeCategoryRadius = 20;
  static const double storeCategoryAspect = 1 / 1.05;
  static const double storeCategoryPreviewWidth = 140;

  @override
  Widget build(BuildContext context) {
    final scale = ImageFramingValues.clampScale(values.imageScale);
    final x = ImageFramingValues.clampPos(values.imagePositionX);
    final y = ImageFramingValues.clampPos(values.imagePositionY);
    final url = imageUrl?.trim();
    final hasImage = url != null && url.isNotEmpty;
    final isStoreTile =
        previewKind == ImageFramingPreviewKind.storeCategoryTile;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            isStoreTile
                ? AppStrings.storeCategoryImageFraming
                : AppStrings.bannerImageFraming,
            style: AppTypography.subtitle,
          ),
          const SizedBox(height: 4),
          Text(
            isStoreTile
                ? AppStrings.storeCategoryImagePreviewSizeHint
                : AppStrings.bannerImagePreviewSizeHint,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final double previewWidth;
              final double previewHeight;
              final double radius;

              if (isStoreTile) {
                previewWidth = storeCategoryPreviewWidth
                    .clamp(0, constraints.maxWidth)
                    .toDouble();
                previewHeight = previewWidth / storeCategoryAspect;
                radius = storeCategoryRadius;
              } else {
                previewWidth = constraints.maxWidth;
                previewHeight = previewWidth * 2 / 7;
                radius = homeBannerRadius;
              }

              return Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  width: previewWidth,
                  height: previewHeight,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE4E4E7),
                    borderRadius: BorderRadius.circular(radius),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x140F172A),
                        blurRadius: 24,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  // Free pan: left/top move the image so part can leave the
                  // frame (clipped). Scale is only from the Masshtab slider.
                  child: hasImage
                      ? LayoutBuilder(
                          builder: (context, box) {
                            final bw = box.maxWidth;
                            final bh = box.maxHeight;
                            final s = scale / 100.0;
                            final w = bw * s;
                            final h = bh * s;
                            final left = bw * x / 100 - w / 2;
                            final top = bh * y / 100 - h / 2;
                            return Stack(
                              clipBehavior: Clip.hardEdge,
                              children: [
                                Positioned(
                                  left: left,
                                  top: top,
                                  width: w,
                                  height: h,
                                  child: Image.network(
                                    url!,
                                    fit: BoxFit.cover,
                                    width: w,
                                    height: h,
                                    errorBuilder: (_, __, ___) => const Center(
                                      child: Icon(Icons.broken_image_outlined),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        )
                      : Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              isStoreTile
                                  ? AppStrings.storeCategoryImagePreviewHint
                                  : AppStrings.bannerImagePreviewHint,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          _SliderRow(
            label: AppStrings.bannerImageScale,
            valueLabel: '$scale%',
            value: scale.toDouble(),
            min: 100,
            max: 200,
            enabled: enabled,
            onChanged: (v) => onChanged(
              values.copyWith(imageScale: v.round()),
            ),
          ),
          _SliderRow(
            label: AppStrings.bannerImagePosX,
            valueLabel: '$x%',
            value: x.toDouble(),
            min: 0,
            max: 100,
            enabled: enabled,
            onChanged: (v) => onChanged(
              values.copyWith(imagePositionX: v.round()),
            ),
          ),
          _SliderRow(
            label: AppStrings.bannerImagePosY,
            valueLabel: '$y%',
            value: y.toDouble(),
            min: 0,
            max: 100,
            enabled: enabled,
            onChanged: (v) => onChanged(
              values.copyWith(imagePositionY: v.round()),
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
    required this.valueLabel,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
    required this.enabled,
  });

  final String label;
  final String valueLabel;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: AppTypography.bodySmall)),
            Text(valueLabel, style: AppTypography.bodySmall),
          ],
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          divisions: (max - min).round(),
          onChanged: enabled ? onChanged : null,
        ),
      ],
    );
  }
}
