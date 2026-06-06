import 'package:dio/dio.dart';
import '../../../core/constants/api_paths.dart';

class DeviceRegistrationRepository {
  DeviceRegistrationRepository(this._dio);

  final Dio _dio;

  Future<void> register({
    required String deviceId,
    required String platform,
    String? pushToken,
  }) async {
    await _dio.post<void>(
      ApiPaths.courierDevicesRegister,
      data: {
        'deviceId': deviceId,
        'platform': platform,
        if (pushToken != null && pushToken.isNotEmpty) 'pushToken': pushToken,
      },
    );
  }

  Future<void> unregister({
    required String deviceId,
    required String platform,
  }) async {
    await _dio.post<void>(
      ApiPaths.courierDevicesUnregister,
      data: {
        'deviceId': deviceId,
        'platform': platform,
      },
    );
  }
}
