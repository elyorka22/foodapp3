import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';

class PushRepository {
  PushRepository(this._dio);

  final Dio _dio;

  Future<void> sendPush({
    required String audience,
    required String title,
    required String body,
    String templateCode = 'SYSTEM',
  }) async {
    await _dio.post<dynamic>(
      ApiPaths.pushSend,
      data: {
        'audience': audience,
        'title': title,
        'body': body,
        'templateCode': templateCode,
      },
    );
  }
}

final pushRepositoryProvider = Provider<PushRepository>((ref) {
  return PushRepository(ref.watch(dioProvider));
});
