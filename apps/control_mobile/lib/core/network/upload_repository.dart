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
  Future<UploadResult> uploadImage({
    required List<int> bytes,
    required String filename,
    String refererPath = '/admin/banners',
  }) async {
    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: filename),
    });
    final origin = AppConfig.normalizedApiBaseUrl.replaceAll(RegExp(r'/api/v1/?$'), '');
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.uploadImage,
      data: form,
      options: Options(
        contentType: 'multipart/form-data',
        headers: {
          'Referer': '$origin$refererPath',
        },
      ),
    );
    return UploadResult.fromJson(res.data ?? <String, dynamic>{});
  }
}

final uploadRepositoryProvider = Provider<UploadRepository>((ref) {
  return UploadRepository(ref.watch(dioProvider));
});
