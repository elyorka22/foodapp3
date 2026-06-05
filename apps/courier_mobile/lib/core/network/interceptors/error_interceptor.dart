import 'package:dio/dio.dart';
import '../api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final data = err.response?.data;
    final message = ApiException.parseMessage(data);
    handler.next(
      err.copyWith(error: ApiException(message: message, statusCode: err.response?.statusCode)),
    );
  }
}
