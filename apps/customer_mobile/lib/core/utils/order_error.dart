import 'package:dio/dio.dart';

import '../network/api_exception.dart';

/// True when the tracking token no longer exists on the server.
bool isOrderMissingError(Object error) {
  if (error is ApiException) {
    return error.statusCode == 404;
  }
  if (error is DioException) {
    final inner = error.error;
    if (inner is ApiException) return inner.statusCode == 404;
    return error.response?.statusCode == 404;
  }
  return false;
}
