import 'package:dio/dio.dart';
import '../../../core/constants/api_paths.dart';

class DeviceRegistrationRepository {
  DeviceRegistrationRepository(this._dio);

  final Dio _dio;

  Future<void> register({
    required String deviceId,
    required String platform,
    String? pushToken,
    String? appVersion,
  }) async {
    await _dio.post<void>(
      ApiPaths.notificationsDevices,
      data: {
        'deviceId': deviceId,
        'platform': platform,
        if (pushToken != null && pushToken.isNotEmpty) 'pushToken': pushToken,
        if (appVersion != null) 'appVersion': appVersion,
      },
    );
  }

  Future<void> unregister({required String deviceId, required String platform}) async {
    await _dio.post<void>(
      ApiPaths.notificationsDevicesUnregister,
      data: {
        'deviceId': deviceId,
        'platform': platform,
      },
    );
  }
}
