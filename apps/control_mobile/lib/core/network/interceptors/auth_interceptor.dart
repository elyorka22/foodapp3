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
    if (!_isPublicAuthPath(options)) {
      try {
        final token = await _storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
      } catch (_) {}
    }
    handler.next(options);
  }

  bool _isPublicAuthPath(RequestOptions options) {
    final path = options.uri.path;
    return path.endsWith('/auth/login') || path.endsWith('/auth/staff/login');
  }
}
