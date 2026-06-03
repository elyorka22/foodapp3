import '../config/app_config.dart';

/// Aligns with frontend/src/lib/image-url.ts
String? resolveImageUrl(String? url) {
  if (url == null || url.trim().isEmpty) return null;
  final trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) return 'https:$trimmed';
  final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
  return '$base${trimmed.startsWith('/') ? '' : '/'}$trimmed';
}
