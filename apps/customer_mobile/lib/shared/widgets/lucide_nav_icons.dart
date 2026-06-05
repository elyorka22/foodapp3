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

  @override
  Widget build(BuildContext context) {
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: active ? 2.25 : 1.75,
      paths: '''
<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
''',
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
    return _LucideStrokeIcon(
      size: size,
      color: color,
      strokeWidth: active ? 2.25 : 1.75,
      paths: '''
<path d="m15 11-1 9"/>
<path d="m19 11-4-7"/>
<path d="M2 11h20"/>
<path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/>
<path d="M4.5 15.5h15"/>
<path d="m5 11 4-7"/>
<path d="m9 11 1 9"/>
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
      strokeWidth: active ? 2.25 : 1.75,
      extra: '<circle cx="12" cy="7" r="4"/>',
      paths: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>',
    );
  }
}
