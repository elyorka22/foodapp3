import '../config/app_config.dart';

/// Turn relative site paths (`/assets/...`) into absolute URLs for Image.network.
String resolveMediaUrl(String? raw) {
  final value = raw?.trim() ?? '';
  if (value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  try {
    final api = Uri.parse(AppConfig.normalizedApiBaseUrl);
    final origin = '${api.scheme}://${api.host}${api.hasPort ? ':${api.port}' : ''}';
    if (value.startsWith('/')) return '$origin$value';
    return '$origin/$value';
  } catch (_) {
    return value;
  }
}
