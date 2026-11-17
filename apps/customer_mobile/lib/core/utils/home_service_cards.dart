import 'dart:math' as math;

import 'image_url.dart';

enum HomeServiceCardKey {
  flowers,
  cosmetics,
  pharmacy,
  restaurants,
  products,
}

class HomeServiceCardLayout {
  const HomeServiceCardLayout({
    required this.imageUrl,
    required this.widthPercent,
    required this.right,
    required this.bottom,
    required this.rotate,
  });

  final String imageUrl;
  final double widthPercent;
  final double right;
  final double bottom;

  /// Degrees — negative tilts counter-clockwise (same as web).
  final double rotate;

  double get rotateRadians => rotate * math.pi / 180;
}

const _assetVer = 'v6';
const _assetBase = 'https://foodapp.uz/assets/home-services';

/// Defaults match frontend/src/lib/home-service-cards.ts
const defaultHomeServiceCards = <HomeServiceCardKey, HomeServiceCardLayout>{
  HomeServiceCardKey.flowers: HomeServiceCardLayout(
    imageUrl: '$_assetBase/flowers.png?$_assetVer',
    widthPercent: 80,
    right: -18,
    bottom: -16,
    rotate: -30,
  ),
  HomeServiceCardKey.cosmetics: HomeServiceCardLayout(
    imageUrl: '$_assetBase/cosmetics.png?$_assetVer',
    widthPercent: 75,
    right: -12,
    bottom: -27,
    rotate: 0,
  ),
  HomeServiceCardKey.pharmacy: HomeServiceCardLayout(
    imageUrl: '$_assetBase/pharmacy.png?$_assetVer',
    widthPercent: 80,
    right: -12,
    bottom: -29,
    rotate: 0,
  ),
  HomeServiceCardKey.restaurants: HomeServiceCardLayout(
    imageUrl: '$_assetBase/restaurants.png?$_assetVer',
    widthPercent: 56,
    right: -13,
    bottom: -27,
    rotate: 1,
  ),
  HomeServiceCardKey.products: HomeServiceCardLayout(
    imageUrl: '$_assetBase/products.png?$_assetVer',
    widthPercent: 103,
    right: -19,
    bottom: -38,
    rotate: -1,
  ),
};

double _clamp(double n, double min, double max) => n.clamp(min, max).toDouble();

HomeServiceCardLayout mergeHomeServiceCard(
  HomeServiceCardKey key, [
  Map<String, dynamic>? override,
]) {
  final base = defaultHomeServiceCards[key]!;
  if (override == null || override.isEmpty) return base;

  var imageUrl = (override['imageUrl'] as String?)?.trim();
  if (imageUrl == null || imageUrl.isEmpty) {
    imageUrl = base.imageUrl;
  } else {
    if (imageUrl.startsWith('/assets/home-services/') && !imageUrl.contains('?')) {
      imageUrl = '$imageUrl?$_assetVer';
    }
    imageUrl = resolveImageUrl(imageUrl) ?? imageUrl;
  }

  return HomeServiceCardLayout(
    imageUrl: imageUrl,
    widthPercent: _clamp(
      (override['widthPercent'] as num?)?.toDouble() ?? base.widthPercent,
      40,
      160,
    ),
    right: _clamp(
      (override['right'] as num?)?.toDouble() ?? base.right,
      -80,
      40,
    ),
    bottom: _clamp(
      (override['bottom'] as num?)?.toDouble() ?? base.bottom,
      -80,
      40,
    ),
    rotate: _clamp(
      (override['rotate'] as num?)?.toDouble() ?? base.rotate,
      -30,
      30,
    ),
  );
}

Map<HomeServiceCardKey, Map<String, dynamic>>? parseHomeServiceCardsJson(
  dynamic raw,
) {
  if (raw is! Map) return null;
  final out = <HomeServiceCardKey, Map<String, dynamic>>{};
  for (final key in HomeServiceCardKey.values) {
    final entry = raw[key.name];
    if (entry is Map<String, dynamic>) {
      out[key] = entry;
    } else if (entry is Map) {
      out[key] = Map<String, dynamic>.from(entry);
    }
  }
  return out.isEmpty ? null : out;
}

HomeServiceCardKey? homeServiceKeyForSlug(String slug) {
  switch (slug.toLowerCase()) {
    case 'flowers':
      return HomeServiceCardKey.flowers;
    case 'perfume':
    case 'cosmetics':
      return HomeServiceCardKey.cosmetics;
    case 'pharmacy':
      return HomeServiceCardKey.pharmacy;
    case 'restaurant':
    case 'restaurants':
      return HomeServiceCardKey.restaurants;
    case 'grocery':
    case 'products':
      return HomeServiceCardKey.products;
    default:
      return null;
  }
}

HomeServiceCardLayout layoutForBusinessTypeSlug({
  required String slug,
  String? imageUrl,
  Map<HomeServiceCardKey, Map<String, dynamic>>? overrides,
}) {
  final key = homeServiceKeyForSlug(slug) ?? HomeServiceCardKey.products;
  final base = mergeHomeServiceCard(key, overrides?[key]);
  final custom = imageUrl?.trim();
  if (custom != null && custom.isNotEmpty) {
    return HomeServiceCardLayout(
      imageUrl: resolveImageUrl(custom) ?? custom,
      widthPercent: base.widthPercent,
      right: base.right,
      bottom: base.bottom,
      rotate: base.rotate,
    );
  }
  return base;
}
