import 'package:dio/dio.dart';
import '../api_exception.dart';
import '../network_connectivity.dart';
import '../../l10n/app_strings.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;
    var message = ApiException.fromDio(err);

    if (err.type == DioExceptionType.connectionError) {
      final online = await hasNetworkConnection();
      if (!online) message = AppStrings.networkOffline;
    }

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        error: ApiException(
          message: message,
          statusCode: response?.statusCode,
          raw: response?.data,
        ),
      ),
    );
  }
}
