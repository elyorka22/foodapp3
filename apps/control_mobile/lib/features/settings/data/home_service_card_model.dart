import '../../../core/utils/json_parse.dart';

const _keys = <String>[
  'flowers',
  'cosmetics',
  'pharmacy',
  'restaurants',
  'products',
];

class HomeServiceCardLayout {
  const HomeServiceCardLayout({
    this.imageUrl = '',
    this.widthPercent = 100,
    this.right = -10,
    this.bottom = -12,
    this.rotate = 0,
  });

  final String imageUrl;
  final double widthPercent;
  final double right;
  final double bottom;
  final double rotate;

  HomeServiceCardLayout copyWith({
    String? imageUrl,
    double? widthPercent,
    double? right,
    double? bottom,
    double? rotate,
  }) {
    return HomeServiceCardLayout(
      imageUrl: imageUrl ?? this.imageUrl,
      widthPercent: widthPercent ?? this.widthPercent,
      right: right ?? this.right,
      bottom: bottom ?? this.bottom,
      rotate: rotate ?? this.rotate,
    );
  }

  factory HomeServiceCardLayout.fromJson(Map<String, dynamic>? json) {
    final map = json ?? const <String, dynamic>{};
    return HomeServiceCardLayout(
      imageUrl: map['imageUrl'] as String? ?? '',
      widthPercent: parseNum(map['widthPercent'], 100).toDouble(),
      right: parseNum(map['right'], -10).toDouble(),
      bottom: parseNum(map['bottom'], -12).toDouble(),
      rotate: parseNum(map['rotate'], 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'imageUrl': imageUrl,
        'widthPercent': widthPercent.round(),
        'right': right.round(),
        'bottom': bottom.round(),
        'rotate': rotate.round(),
      };

  static double clampWidth(double v) => v.clamp(40, 160);
  static double clampOffset(double v) => v.clamp(-80, 40);
  static double clampRotate(double v) => v.clamp(-30, 30);
}

class HomeServiceCards {
  const HomeServiceCards({
    required this.flowers,
    required this.cosmetics,
    required this.pharmacy,
    required this.restaurants,
    required this.products,
  });

  final HomeServiceCardLayout flowers;
  final HomeServiceCardLayout cosmetics;
  final HomeServiceCardLayout pharmacy;
  final HomeServiceCardLayout restaurants;
  final HomeServiceCardLayout products;

  /// Defaults match Control-tuned live layout (foodapp.uz settings).
  static const defaults = HomeServiceCards(
    flowers: HomeServiceCardLayout(
      imageUrl: '/assets/home-services/flowers.png',
      widthPercent: 119,
      right: -28,
      bottom: -21,
      rotate: -30,
    ),
    cosmetics: HomeServiceCardLayout(
      imageUrl: '/assets/home-services/cosmetics.png',
      widthPercent: 110,
      right: -26,
      bottom: -39,
    ),
    pharmacy: HomeServiceCardLayout(
      imageUrl: '/assets/home-services/pharmacy.png',
      widthPercent: 112,
      right: -18,
      bottom: -29,
    ),
    restaurants: HomeServiceCardLayout(
      imageUrl: '/assets/home-services/restaurants.png',
      widthPercent: 56,
      right: -13,
      bottom: -27,
      rotate: 1,
    ),
    products: HomeServiceCardLayout(
      imageUrl: '/assets/home-services/products.png',
      widthPercent: 109,
      right: -19,
      bottom: -38,
      rotate: -1,
    ),
  );

  HomeServiceCardLayout operator [](String key) {
    switch (key) {
      case 'flowers':
        return flowers;
      case 'cosmetics':
        return cosmetics;
      case 'pharmacy':
        return pharmacy;
      case 'restaurants':
        return restaurants;
      case 'products':
        return products;
      default:
        return const HomeServiceCardLayout();
    }
  }

  HomeServiceCards copyWithKey(String key, HomeServiceCardLayout layout) {
    return HomeServiceCards(
      flowers: key == 'flowers' ? layout : flowers,
      cosmetics: key == 'cosmetics' ? layout : cosmetics,
      pharmacy: key == 'pharmacy' ? layout : pharmacy,
      restaurants: key == 'restaurants' ? layout : restaurants,
      products: key == 'products' ? layout : products,
    );
  }

  factory HomeServiceCards.fromJson(dynamic raw) {
    final map = raw is Map<String, dynamic>
        ? raw
        : raw is Map
            ? Map<String, dynamic>.from(raw)
            : <String, dynamic>{};
    HomeServiceCardLayout pick(String key, HomeServiceCardLayout fallback) {
      final value = map[key];
      if (value is Map<String, dynamic>) {
        return HomeServiceCardLayout.fromJson(value);
      }
      if (value is Map) {
        return HomeServiceCardLayout.fromJson(Map<String, dynamic>.from(value));
      }
      return fallback;
    }

    return HomeServiceCards(
      flowers: pick('flowers', defaults.flowers),
      cosmetics: pick('cosmetics', defaults.cosmetics),
      pharmacy: pick('pharmacy', defaults.pharmacy),
      restaurants: pick('restaurants', defaults.restaurants),
      products: pick('products', defaults.products),
    );
  }

  Map<String, dynamic> toJson() => {
        for (final key in _keys) key: this[key].toJson(),
      };

  static List<String> get keys => List<String>.from(_keys);
}
