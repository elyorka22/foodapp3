import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../constants/api_paths.dart';
import 'dio_client.dart';

class UploadResult {
  const UploadResult({required this.url, this.key, this.filename});

  final String url;
  final String? key;
  final String? filename;

  factory UploadResult.fromJson(Map<String, dynamic> json) {
    return UploadResult(
      url: json['url'] as String? ?? '',
      key: json['key'] as String?,
      filename: json['filename'] as String?,
    );
  }
}

class UploadRepository {
  UploadRepository(this._dio);

  final Dio _dio;

  /// Uploads an image. [refererPath] guides storage folder (e.g. `/admin/banners`).
  ///
  /// Do not set `Content-Type: multipart/form-data` manually — without the
  /// boundary Nest/multer never finishes reading the body and the client
  /// shows "Server javob bermadi (timeout)".
  Future<UploadResult> uploadImage({
    required List<int> bytes,
    required String filename,
    String refererPath = '/admin/banners',
  }) async {
    final safeName = _safeImageFilename(filename);
    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        bytes,
        filename: safeName,
        contentType: DioMediaType.parse(_mimeForFilename(safeName)),
      ),
    });
    final origin =
        AppConfig.normalizedApiBaseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.uploadImage,
      data: form,
      options: Options(
        // Do not set contentType — Dio adds multipart boundary for FormData.
        headers: {
          'Referer': '$origin$refererPath',
        },
        receiveTimeout: const Duration(seconds: 120),
        sendTimeout: null,
      ),
    );
    return UploadResult.fromJson(res.data ?? <String, dynamic>{});
  }

  static String _safeImageFilename(String raw) {
    final name = raw.trim().isEmpty ? 'image.jpg' : raw.trim();
    final lower = name.toLowerCase();
    if (lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp')) {
      return name;
    }
    // Gallery/HEIC picks often lack a valid image extension for the API.
    return '${name.split('.').first}.jpg';
  }

  static String _mimeForFilename(String name) {
    final lower = name.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }
}

final uploadRepositoryProvider = Provider<UploadRepository>((ref) {
  return UploadRepository(ref.watch(dioProvider));
});
