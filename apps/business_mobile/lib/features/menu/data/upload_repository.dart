import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';

final uploadRepositoryProvider = Provider<UploadRepository>((ref) {
  return UploadRepository(ref.watch(dioProvider));
});

class UploadRepository {
  UploadRepository(this._dio);

  final Dio _dio;

  Future<String> uploadImage(String filePath, {String? fileName}) async {
    final name = fileName ?? filePath.split('/').last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: name),
    });
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.uploadImage,
      data: formData,
    );
    final url = res.data?['url'];
    if (url is! String || url.isEmpty) {
      throw StateError('Upload failed');
    }
    return url;
  }
}
