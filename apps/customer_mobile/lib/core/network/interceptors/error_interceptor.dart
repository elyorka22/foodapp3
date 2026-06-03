import 'package:dio/dio.dart';
import '../api_exception.dart';
import '../network_connectivity.dart';
import '../../l10n/app_strings.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;
    final message = await _resolveMessage(err);

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

  Future<String> _resolveMessage(DioException err) async {
    if (err.response?.data != null) {
      return ApiException.parseMessage(err.response!.data);
    }

    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout) {
      return AppStrings.networkTimeout;
    }

    if (err.type == DioExceptionType.connectionError) {
      final online = await hasNetworkConnection();
      if (!online) return AppStrings.networkOffline;
      return AppStrings.networkError;
    }

    return AppStrings.networkError;
  }
}
