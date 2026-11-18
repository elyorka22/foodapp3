import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Nav stroke icons matching web `bottom-nav.tsx` (Lucide shopping-cart + user).
///
/// Uses [SvgTheme.currentColor] — not [ColorFilter] — so stroke weight matches web.
class _WebNavStrokeIcon extends StatelessWidget {
  const _WebNavStrokeIcon({
    required this.paths,
    required this.size,
    required this.color,
  });

  final String paths;
  final double size;
  final Color color;

  static const _stroke = 2.0;

  @override
  Widget build(BuildContext context) {
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="$_stroke" stroke-linecap="round" stroke-linejoin="round">
  $paths
</svg>
''';
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      allowDrawingOutsideViewBox: true,
      theme: SvgTheme(currentColor: color),
    );
  }
}

/// Brand wing mark for home tab — same asset + grayscale idle as web.
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

/// Lucide `shopping-cart` — identical paths to web [CartIcon].
class LucideShoppingBasketNavIcon extends StatelessWidget {
  const LucideShoppingBasketNavIcon({
    super.key,
    this.size = 31,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return _WebNavStrokeIcon(
      size: size,
      color: color ?? Theme.of(context).colorScheme.onSurface,
      paths: '''
<circle cx="8" cy="21" r="1"/>
<circle cx="19" cy="21" r="1"/>
<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
''',
    );
  }
}

/// Lucide `user` — identical paths to web [ProfileIcon].
class LucideUserNavIcon extends StatelessWidget {
  const LucideUserNavIcon({
    super.key,
    this.size = 31,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return _WebNavStrokeIcon(
      size: size,
      color: color ?? Theme.of(context).colorScheme.onSurface,
      paths: '''
<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
<circle cx="12" cy="7" r="4"/>
''',
    );
  }
}
