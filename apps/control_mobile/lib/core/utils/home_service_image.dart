import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'media_url.dart';

/// Bundled defaults for home category tiles (same files as web `/assets/home-services/`).
const _bundledByKey = <String, String>{
  'flowers': 'assets/home-services/flowers.png',
  'cosmetics': 'assets/home-services/cosmetics.png',
  'pharmacy': 'assets/home-services/pharmacy.png',
  'restaurants': 'assets/home-services/restaurants.png',
  'products': 'assets/home-services/products.png',
};

const _bundledFiles = <String>{
  'flowers.png',
  'cosmetics.png',
  'pharmacy.png',
  'restaurants.png',
  'products.png',
};

/// True when [url] is a custom upload (Spaces/CDN), not the default site asset.
bool isCustomHomeServiceUrl(String? url) {
  final raw = url?.trim() ?? '';
  if (raw.isEmpty) return false;
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    return false;
  }
  try {
    final path = Uri.parse(raw).path;
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    if (parts.isNotEmpty && _bundledFiles.contains(parts.last)) {
      // Hosted default path → still treat as bundled default.
      return false;
    }
  } catch (_) {}
  return true;
}

/// Returns Flutter asset path when [url] points at a default home-service file.
String? bundledHomeServiceAssetPath(String? url, {String? cardKey}) {
  if (cardKey != null && _bundledByKey.containsKey(cardKey)) {
    // Custom uploaded URL wins over the bundled default.
    if (!isCustomHomeServiceUrl(url)) {
      return _bundledByKey[cardKey];
    }
  }

  final raw = url?.trim() ?? '';
  if (raw.isEmpty) return null;
  String path;
  try {
    path = Uri.parse(raw).path;
  } catch (_) {
    path = raw.split('?').first;
  }
  if (path.isEmpty) path = raw.split('?').first;
  final parts = path.split('/').where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return null;
  final name = parts.last;
  if (!_bundledFiles.contains(name)) return null;
  return 'assets/home-services/$name';
}

/// Image for home-service preview: local bundled asset for defaults, else network.
Widget buildHomeServiceImage({
  required String? url,
  String? cardKey,
  BoxFit fit = BoxFit.contain,
  double? width,
  double? height,
}) {
  final asset = bundledHomeServiceAssetPath(url, cardKey: cardKey);
  if (asset != null) {
    return Image.asset(
      asset,
      fit: fit,
      width: width,
      height: height,
      // Bust hot-reload / web asset cache when PNG bytes change.
      key: ValueKey<String>('$asset#v6'),
      errorBuilder: (_, __, ___) => const _BrokenImage(),
    );
  }
  final remote = resolveMediaUrl(url);
  if (remote.isEmpty) return const _BrokenImage();
  return Image.network(
    remote,
    fit: fit,
    width: width,
    height: height,
    errorBuilder: (_, __, ___) => const _BrokenImage(),
  );
}

class _BrokenImage extends StatelessWidget {
  const _BrokenImage();

  @override
  Widget build(BuildContext context) {
    return const ColoredBox(
      color: AppColors.surfaceMuted,
      child: Center(
        child: Icon(Icons.broken_image_outlined, color: AppColors.textMuted),
      ),
    );
  }
}
