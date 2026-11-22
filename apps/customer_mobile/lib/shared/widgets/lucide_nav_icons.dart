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

/// Filled takeaway basket — same mark as web [CartIcon].
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
    final paint = color ?? Theme.of(context).colorScheme.onSurface;
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M6.15 9.85c.15-1.85 1.7-3.15 3.45-2.9 1.05.15 1.85.95 2.15 1.9.1.25-.1.45-.35.45H6.55c-.3 0-.5-.2-.4-.45z"/>
  <path d="M14.35 7.55c.25-.7 1.2-.95 1.8-.35l1.15 1.25c.25.28.05.7-.32.7h-2.25c-.38 0-.58-.42-.38-.7z"/>
  <path fill-rule="evenodd" d="M4.15 10.15h15.7c.55 0 .95.5.85 1.05l-1.45 8.15A1.7 1.7 0 0 1 17.58 21H6.42a1.7 1.7 0 0 1-1.67-1.65L3.3 11.2c-.1-.55.3-1.05.85-1.05zm4.55.15v2.35c0 1.85 1.35 3.15 3.3 3.15s3.3-1.3 3.3-3.15V10.3h-1.35v2.15c0 1.05-.8 1.8-1.95 1.8s-1.95-.75-1.95-1.8V10.3H8.7z"/>
</svg>
''';
    return SvgPicture.string(
      svg,
      width: size,
      height: size,
      theme: SvgTheme(currentColor: paint),
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
