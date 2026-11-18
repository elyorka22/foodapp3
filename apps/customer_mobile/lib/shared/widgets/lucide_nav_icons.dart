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

String _svgHex(Color color) {
  final hex = color.toARGB32().toRadixString(16).padLeft(8, '0');
  return '#${hex.substring(2)}';
}

/// FoodApp brand mark: cloche + speed lines (matches app icon / web home tab).
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
    final c = _svgHex(color ?? Theme.of(context).colorScheme.onSurface);
    if (active) {
      final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="$c">
  <rect x="1.5" y="8.2" width="4.2" height="1.55" rx="0.75"/>
  <rect x="1.5" y="11.2" width="5.4" height="1.55" rx="0.75"/>
  <rect x="1.5" y="14.2" width="3.4" height="1.55" rx="0.75"/>
  <rect x="13.1" y="3.2" width="4.2" height="1.7" rx="0.85"/>
  <path d="M9.2 9.4c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6v7.1H9.2V9.4Z"/>
  <rect x="8.2" y="16.6" width="11.6" height="2.2" rx="1.1"/>
  <path d="M11.2 10.2c.6-1.6 1.9-2.6 3.4-2.9" fill="none" stroke="#F5F5F7" stroke-width="1.35" stroke-linecap="round"/>
</svg>
''';
      return SvgPicture.string(svg, width: size, height: size);
    }

    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="$c" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1.8 9h3.6M1.8 12h4.8M1.8 15h2.8"/>
  <rect x="13.2" y="3.4" width="3.8" height="1.5" rx="0.75"/>
  <path d="M9.4 9.2a5.4 5.4 0 0 1 10.8 0V16H9.4V9.2Z"/>
  <rect x="8.4" y="16.4" width="11.2" height="2" rx="1"/>
  <path d="M11.4 10c.55-1.4 1.7-2.3 3-2.55"/>
</svg>
''';
    return SvgPicture.string(svg, width: size, height: size);
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
