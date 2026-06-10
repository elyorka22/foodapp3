import 'package:dio/dio.dart';
import '../../storage/token_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage);

  final TokenStorage _storage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (!_isPublicAuthPath(options.path)) {
      try {
        final token = await _storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      } catch (_) {}
    }
    handler.next(options);
  }

  bool _isPublicAuthPath(String path) {
    return path.endsWith('/auth/login') || path.endsWith('/auth/staff/login');
  }
}
