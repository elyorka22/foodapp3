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
  /// Home strip inside the phone page: width up to 398, aspect 7:2, radius 24.
  homeBanner,

  /// Restaurant menu carousel: content width, height 144, radius 24.
  restaurantMenuBanner,

  /// Store menu carousel: content width, height 112, radius 24.
  storeMenuBanner,

  /// Store menu category tile: 3 columns, aspect 1:1.05, pan crop, radius 20.
  storeCategoryTile,

  /// Home dish-category card: 88×90, contain, radius 20.
  dishCategory,
}

/// How production places the photo inside the frame.
enum ProductionFrameMode { cover, contain, pan }

/// Same crop as the customer web/app: focal point + zoom.
class ProductionFramedImage extends StatelessWidget {
  const ProductionFramedImage({
    super.key,
    required this.url,
    required this.scale,
    required this.x,
    required this.y,
    required this.mode,
  });

  final String url;
  final int scale;
  final int x;
  final int y;
  final ProductionFrameMode mode;

  @override
  Widget build(BuildContext context) {
    if (mode == ProductionFrameMode.pan) return _pan();
    return _coverOrContain();
  }

  Widget _coverOrContain() {
    final s = ImageFramingValues.clampScale(scale) / 100;
    final align = Alignment(
      (ImageFramingValues.clampPos(x) / 50) - 1,
      (ImageFramingValues.clampPos(y) / 50) - 1,
    );
    Widget image = Image.network(
      url,
      fit: mode == ProductionFrameMode.contain ? BoxFit.contain : BoxFit.cover,
      alignment: align,
      width: double.infinity,
      height: double.infinity,
      errorBuilder: (_, __, ___) => const Center(
        child: Icon(Icons.broken_image_outlined, color: AppColors.textMuted),
      ),
    );
    if (s != 1) {
      image = Transform.scale(scale: s, alignment: align, child: image);
    }
    return ClipRect(child: image);
  }

  Widget _pan() {
    final s = ImageFramingValues.clampScale(scale) / 100;
    final px = ImageFramingValues.clampPos(x) / 100;
    final py = ImageFramingValues.clampPos(y) / 100;
    return LayoutBuilder(
      builder: (context, box) {
        final bw = box.maxWidth;
        final bh = box.maxHeight;
        final w = bw * s;
        final h = bh * s;
        return Stack(
          clipBehavior: Clip.hardEdge,
          children: [
            Positioned(
              left: bw * px - w / 2,
              top: bh * py - h / 2,
              width: w,
              height: h,
              child: Image.network(
                url,
                fit: BoxFit.cover,
                width: w,
                height: h,
                errorBuilder: (_, __, ___) => const Center(
                  child: Icon(
                    Icons.broken_image_outlined,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
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

  static const double _phoneWidth = 430;

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
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
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
          const SizedBox(height: 8),
          _LivePreview(
            kind: previewKind,
            hasImage: hasImage,
            url: url,
            scale: scale,
            x: x,
            y: y,
          ),
          const SizedBox(height: 8),
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

class _LivePreview extends StatelessWidget {
  const _LivePreview({
    required this.kind,
    required this.hasImage,
    required this.url,
    required this.scale,
    required this.x,
    required this.y,
  });

  final ImageFramingPreviewKind kind;
  final bool hasImage;
  final String? url;
  final int scale;
  final int x;
  final int y;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final frame = _frameFor(kind, constraints.maxWidth);
        return Align(
          alignment: Alignment.centerLeft,
          child: Container(
            width: frame.width,
            height: frame.height,
            decoration: BoxDecoration(
              color: frame.color,
              borderRadius: BorderRadius.circular(frame.radius),
            ),
            clipBehavior: Clip.antiAlias,
            child: hasImage
                ? ProductionFramedImage(
                    url: url!,
                    scale: scale,
                    x: x,
                    y: y,
                    mode: frame.mode,
                  )
                : const Center(
                    child: Icon(
                      Icons.image_outlined,
                      color: AppColors.textMuted,
                    ),
                  ),
          ),
        );
      },
    );
  }

  /// Phone column is 430px. Sizes match the customer page, not a thumbnail.
  _Frame _frameFor(ImageFramingPreviewKind kind, double maxWidth) {
    switch (kind) {
      case ImageFramingPreviewKind.homeBanner:
        final width = _fit(maxWidth, ImageFramingControls._phoneWidth - 32);
        return _Frame(
          width: width,
          height: width * 2 / 7,
          radius: 24,
          color: const Color(0xFFE4E4E7),
          mode: ProductionFrameMode.cover,
        );
      case ImageFramingPreviewKind.restaurantMenuBanner:
        final width = _fit(maxWidth, ImageFramingControls._phoneWidth - 24);
        return _Frame(
          width: width,
          height: 144,
          radius: 24,
          color: const Color(0xFFE4E4E7),
          mode: ProductionFrameMode.cover,
        );
      case ImageFramingPreviewKind.storeMenuBanner:
        final width = _fit(maxWidth, ImageFramingControls._phoneWidth - 32);
        return _Frame(
          width: width,
          height: 112,
          radius: 24,
          color: const Color(0xFFE4E4E7),
          mode: ProductionFrameMode.cover,
        );
      case ImageFramingPreviewKind.storeCategoryTile:
        final inner = ImageFramingControls._phoneWidth - 32;
        final tile = (inner - 20) / 3;
        final width = tile > maxWidth ? maxWidth : tile;
        return _Frame(
          width: width,
          height: width * 1.05,
          radius: 20,
          color: Colors.white,
          mode: ProductionFrameMode.pan,
        );
      case ImageFramingPreviewKind.dishCategory:
        return const _Frame(
          width: 88,
          height: 90,
          radius: 20,
          color: Colors.white,
          mode: ProductionFrameMode.contain,
        );
    }
  }

  double _fit(double maxWidth, double phoneWidth) {
    if (maxWidth <= 0) return phoneWidth;
    return maxWidth < phoneWidth ? maxWidth : phoneWidth;
  }
}

class _Frame {
  const _Frame({
    required this.width,
    required this.height,
    required this.radius,
    required this.color,
    required this.mode,
  });

  final double width;
  final double height;
  final double radius;
  final Color color;
  final ProductionFrameMode mode;
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
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            trackHeight: 3,
            overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
          ),
          child: Slider(
            value: value.clamp(min, max),
            min: min,
            max: max,
            divisions: (max - min).round(),
            onChanged: enabled ? onChanged : null,
          ),
        ),
      ],
    );
  }
}
