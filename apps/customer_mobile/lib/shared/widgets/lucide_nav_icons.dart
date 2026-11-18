import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Lucide nav icons — same set as web `bottom-nav.tsx` (Home, ShoppingBasket, User).
class _LucideStrokeIcon extends StatelessWidget {
  const _LucideStrokeIcon({
    required this.paths,
    this.size = 28,
    this.color,
    this.strokeWidth = 1.75,
    this.extra,
  });

  final String paths;
  final String? extra;
  final double size;
  final Color? color;
  final double strokeWidth;

  @override
  Widget build(BuildContext context) {
    final c = color ?? Theme.of(context).colorScheme.onSurface;
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="$strokeWidth" stroke-linecap="round" stroke-linejoin="round">
  $paths${extra ?? ''}
</svg>
''';
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(c, BlendMode.srcIn),
    );
  }
}

/// New brand wing mark for home tab — matches rebrand logo / web home tab.
class LucideHomeNavIcon extends StatelessWidget {
  const LucideHomeNavIcon({
    super.key,
    this.size = 28,
    this.color,
    this.active = false,
  });

  final double size;
  final Color? color;
  final bool active;

  static const _grayScale = ColorFilter.matrix(<double>[
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0, 0, 0, 1, 0,
  ]);

  @override
  Widget build(BuildContext context) {
    final image = Image.asset(
      'assets/images/brand_wing.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      errorBuilder: (_, __, ___) => Icon(
        Icons.home_rounded,
        size: size,
        color: color,
      ),
    );

    if (active) return image;

    return Opacity(
      opacity: 0.5,
      child: ColorFiltered(
        colorFilter: _grayScale,
        child: image,
      ),
    );
  }
}

/// Web uses `ShoppingBasket`, not shopping bag / cart.
class LucideShoppingBasketNavIcon extends StatelessWidget {
  const LucideShoppingBasketNavIcon({
    super.key,
    this.size = 28,
    this.color,
    this.active = false,
  });

  final double size;
  final Color? color;
  final bool active;

  @override
  Widget build(BuildContext context) {
    // Same cart glyph as web `bottom-nav.tsx` CartIcon.
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: active ? 2.15 : 1.85,
      paths: '''
<path d="M3 4h2.2l1.5 8.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L21 7H7"/>
<circle cx="9.5" cy="19" r="1.4"/>
<circle cx="17.5" cy="19" r="1.4"/>
''',
    );
  }
}

class LucideUserNavIcon extends StatelessWidget {
  const LucideUserNavIcon({
    super.key,
    this.size = 28,
    this.color,
    this.active = false,
  });

  final double size;
  final Color? color;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: active ? 2.15 : 1.85,
      extra: '<circle cx="12" cy="8" r="3.4" fill="none"/>',
      paths:
          '<path d="M5.2 19.2c1.2-2.6 3.8-4.2 6.8-4.2s5.6 1.6 6.8 4.2"/>',
    );
  }
}
