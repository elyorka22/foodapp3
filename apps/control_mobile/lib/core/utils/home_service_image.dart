import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'media_url.dart';

/// Bundled defaults for home category tiles (same files as web `/assets/home-services/`).
const _bundledFiles = <String>{
  'flowers.png',
  'cosmetics.png',
  'pharmacy.png',
  'restaurants.png',
  'products.png',
};

/// Returns Flutter asset path when [url] points at a default home-service file.
String? bundledHomeServiceAssetPath(String? url) {
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

/// Image for home-service preview: local asset first, then network.
Widget buildHomeServiceImage({
  required String? url,
  BoxFit fit = BoxFit.contain,
  double? width,
  double? height,
}) {
  final asset = bundledHomeServiceAssetPath(url);
  if (asset != null) {
    return Image.asset(
      asset,
      fit: fit,
      width: width,
      height: height,
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
