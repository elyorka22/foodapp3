import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/network/api_exception.dart';
import 'package:control_mobile/shared/models/auth_model.dart';

void main() {
  group('ApiException HTTP vs timeout', () {
    DioException dioError({
      required int status,
      Object? data,
      DioExceptionType type = DioExceptionType.badResponse,
    }) {
      return DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: status,
          data: data,
        ),
        type: type,
      );
    }

    test('maps HTTP 401', () {
      final message = ApiException.fromDio(
        dioError(status: 401, data: {'message': 'Invalid credentials'}),
      );
      expect(message.toLowerCase(), contains('parol'));
    });

    test('maps HTTP 400', () {
      final message = ApiException.fromDio(
        dioError(status: 400, data: {'message': 'Invalid login client'}),
      );
      expect(message.toLowerCase(), contains('client'));
    });

    test('maps HTTP 403', () {
      final message = ApiException.fromDio(
        dioError(status: 403, data: {'message': 'Forbidden'}),
      );
      expect(message, contains('SUPER_ADMIN'));
    });

    test('HTTP 401 wins over receiveTimeout type', () {
      final message = ApiException.fromDio(
        dioError(
          status: 401,
          data: {'message': 'Invalid credentials'},
          type: DioExceptionType.receiveTimeout,
        ),
      );
      expect(message.toLowerCase(), contains('parol'));
      expect(message.toLowerCase(), isNot(contains('timeout')));
    });

    test('HTTP 403 wins over receiveTimeout type', () {
      final message = ApiException.fromDio(
        dioError(
          status: 403,
          data: {'message': 'Forbidden'},
          type: DioExceptionType.receiveTimeout,
        ),
      );
      expect(message, contains('SUPER_ADMIN'));
      expect(message.toLowerCase(), isNot(contains('timeout')));
    });

    test('receiveTimeout without response shows timeout string', () {
      final message = ApiException.fromDio(
        DioException(
          requestOptions: RequestOptions(path: '/auth/login'),
          type: DioExceptionType.receiveTimeout,
        ),
      );
      expect(message.toLowerCase(), contains('timeout'));
      expect(message, contains('Server javob bermadi'));
    });
  });

  group('AuthResponseModel', () {
    test('parses Nest login success body', () {
      final auth = AuthResponseModel.fromJson({
        'accessToken': 'header.payload.sig',
        'user': {
          'id': 'u1',
          'fullName': 'Admin',
          'email': 'a@b.c',
          'role': 'SUPER_ADMIN',
        },
      });
      expect(auth.accessToken, startsWith('header.'));
      expect(auth.user.isSuperAdmin, isTrue);
    });
  });
}
