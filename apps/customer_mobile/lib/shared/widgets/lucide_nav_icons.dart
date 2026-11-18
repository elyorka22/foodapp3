import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Lucide nav icons — same set as web `bottom-nav.tsx` (Home, shopping-cart, user).
class _LucideStrokeIcon extends StatelessWidget {
  const _LucideStrokeIcon({
    required this.paths,
    this.size = 28,
    this.color,
    this.strokeWidth = 2,
  });

  final String paths;
  final double size;
  final Color? color;
  final double strokeWidth;

  @override
  Widget build(BuildContext context) {
    final c = color ?? Theme.of(context).colorScheme.onSurface;
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="$strokeWidth" stroke-linecap="round" stroke-linejoin="round">
  $paths
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

/// Lucide `shopping-cart` — same stroke family as [LucideUserNavIcon].
class LucideShoppingBasketNavIcon extends StatelessWidget {
  const LucideShoppingBasketNavIcon({
    super.key,
    this.size = 28,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: 2,
      paths: '''
<circle cx="8" cy="21" r="1"/>
<circle cx="19" cy="21" r="1"/>
<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
''',
    );
  }
}

/// Lucide `user` — same stroke as cart.
class LucideUserNavIcon extends StatelessWidget {
  const LucideUserNavIcon({
    super.key,
    this.size = 28,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: 2,
      paths: '''
<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
<circle cx="12" cy="7" r="4"/>
''',
    );
  }
}
