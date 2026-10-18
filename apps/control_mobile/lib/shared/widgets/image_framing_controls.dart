import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
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

  static int clampScale(int? v) => (v ?? 100).clamp(50, 200);
  static int clampPos(int? v) => (v ?? 50).clamp(0, 100);
}

/// Preview + sliders matching web admin framing (scale 50–200, position 0–100).
class ImageFramingControls extends StatelessWidget {
  const ImageFramingControls({
    super.key,
    required this.imageUrl,
    required this.values,
    required this.onChanged,
    this.aspectRatio = 2,
    this.enabled = true,
  });

  final String? imageUrl;
  final ImageFramingValues values;
  final ValueChanged<ImageFramingValues> onChanged;
  final double aspectRatio;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final scale = ImageFramingValues.clampScale(values.imageScale);
    final x = ImageFramingValues.clampPos(values.imagePositionX);
    final y = ImageFramingValues.clampPos(values.imagePositionY);
    final url = imageUrl?.trim();
    final hasImage = url != null && url.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppStrings.bannerImageFraming, style: AppTypography.subtitle),
          const SizedBox(height: 10),
          AspectRatio(
            aspectRatio: aspectRatio,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: ColoredBox(
                color: const Color(0xFFE4E4E7),
                child: hasImage
                    ? Transform.scale(
                        scale: scale / 100,
                        alignment: Alignment(
                          (x / 50) - 1,
                          (y / 50) - 1,
                        ),
                        child: Image.network(
                          url,
                          fit: BoxFit.cover,
                          alignment: Alignment(
                            (x / 50) - 1,
                            (y / 50) - 1,
                          ),
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(Icons.broken_image_outlined),
                          ),
                        ),
                      )
                    : Center(
                        child: Text(
                          AppStrings.bannerImagePreviewHint,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          _SliderRow(
            label: AppStrings.bannerImageScale,
            valueLabel: '$scale%',
            value: scale.toDouble(),
            min: 50,
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
