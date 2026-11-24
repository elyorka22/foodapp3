import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Nav icons matching web `bottom-nav.tsx`. All three use one size and one flat fill.
class LucideHomeNavIcon extends StatelessWidget {
  const LucideHomeNavIcon({
    super.key,
    this.size = 30,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final paint = color ?? Theme.of(context).colorScheme.onSurface;
    return Image.asset(
      'assets/images/brand_wing_nav.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
      color: paint,
      colorBlendMode: BlendMode.srcIn,
      errorBuilder: (_, __, ___) => Icon(
        Icons.home_rounded,
        size: size,
        color: paint,
      ),
    );
  }
}

/// Filled takeaway basket — same mark and scale as web [CartIcon].
class LucideShoppingBasketNavIcon extends StatelessWidget {
  const LucideShoppingBasketNavIcon({
    super.key,
    this.size = 30,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final paint = color ?? Theme.of(context).colorScheme.onSurface;
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <g transform="translate(12 12) scale(1.18) translate(-12 -13)">
    <path d="M6.15 9.85c.15-1.85 1.7-3.15 3.45-2.9 1.05.15 1.85.95 2.15 1.9.1.25-.1.45-.35.45H6.55c-.3 0-.5-.2-.4-.45z"/>
    <path d="M14.35 7.55c.25-.7 1.2-.95 1.8-.35l1.15 1.25c.25.28.05.7-.32.7h-2.25c-.38 0-.58-.42-.38-.7z"/>
    <path fill-rule="evenodd" d="M4.15 10.15h15.7c.55 0 .95.5.85 1.05l-1.45 8.15A1.7 1.7 0 0 1 17.58 21H6.42a1.7 1.7 0 0 1-1.67-1.65L3.3 11.2c-.1-.55.3-1.05.85-1.05zm4.55.15v2.35c0 1.85 1.35 3.15 3.3 3.15s3.3-1.3 3.3-3.15V10.3h-1.35v2.15c0 1.05-.8 1.8-1.95 1.8s-1.95-.75-1.95-1.8V10.3H8.7z"/>
  </g>
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

/// Filled user — same weight as the basket, matching web [ProfileIcon].
class LucideUserNavIcon extends StatelessWidget {
  const LucideUserNavIcon({
    super.key,
    this.size = 30,
    this.color,
  });

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final paint = color ?? Theme.of(context).colorScheme.onSurface;
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="12" cy="8" r="3.5"/>
  <path d="M5.1 19.15c.55-3.35 3.15-5.35 6.9-5.35s6.35 2 6.9 5.35c.14.85-.5 1.6-1.35 1.6H6.45c-.85 0-1.49-.75-1.35-1.6z"/>
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
