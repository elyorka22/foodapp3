import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/config/app_config.dart';
import 'package:control_mobile/core/l10n/app_strings.dart';
import 'package:control_mobile/core/layout/breakpoints.dart';
import 'package:control_mobile/core/network/api_exception.dart';
import 'package:control_mobile/core/theme/app_theme.dart';
import 'package:control_mobile/features/auth/data/auth_repository.dart';
import 'package:control_mobile/features/auth/presentation/login_screen.dart';
import 'package:control_mobile/features/dashboard/presentation/dashboard_screen.dart';
import 'package:control_mobile/features/auth/providers/auth_provider.dart';
import 'package:control_mobile/shared/models/auth_model.dart';
import 'package:control_mobile/shared/widgets/placeholder_banner.dart';

void main() {
  group('Auth payload', () {
    test('email login includes client=control', () {
      final payload = AuthRepository.buildLoginPayload(
        'Admin@FoodApp.Local',
        'DummyPass123!',
      );
      expect(payload['email'], 'admin@foodapp.local');
      expect(payload.containsKey('phone'), isFalse);
      expect(payload['password'], 'DummyPass123!');
      expect(payload['client'], AppConfig.clientId);
      expect(payload['client'], 'control');
    });

    test('phone login includes client=control', () {
      final payload = AuthRepository.buildLoginPayload('900000001', 'DummyPass123!');
      expect(payload['phone'], '+998900000001');
      expect(payload.containsKey('email'), isFalse);
      expect(payload['client'], 'control');
    });
  });

  group('ApiException login client errors', () {
    DioException dioError({
      required int status,
      Object? data,
    }) {
      return DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: status,
          data: data,
        ),
        type: DioExceptionType.badResponse,
      );
    }

    test('maps HTTP 403 without leaking secrets', () {
      final message = ApiException.fromDio(
        dioError(
          status: 403,
          data: {'message': 'This account cannot sign in via this client'},
        ),
      );
      expect(message, contains('SUPER_ADMIN'));
      expect(message.toLowerCase(), isNot(contains('token')));
      expect(message.toLowerCase(), isNot(contains('password')));
      expect(message, isNot(contains('DummyPass')));
      expect(message, isNot(contains('This account cannot sign in')));
    });

    test('maps HTTP 400 invalid client without leaking secrets', () {
      final message = ApiException.fromDio(
        dioError(
          status: 400,
          data: {'message': 'Invalid login client'},
        ),
      );
      expect(message.toLowerCase(), contains('client'));
      expect(message.toLowerCase(), isNot(contains('bearer')));
      expect(message.toLowerCase(), isNot(contains('password')));
    });

    test('formatError unwraps DioException ApiException', () {
      final dio = dioError(status: 403, data: {'message': 'Forbidden'});
      final wrapped = dio.copyWith(
        error: ApiException(
          message: ApiException.fromDio(dio),
          statusCode: 403,
        ),
      );
      final text = ApiException.formatError(wrapped);
      expect(text, contains('SUPER_ADMIN'));
      expect(text.toLowerCase(), isNot(contains('forbidden')));
    });
  });

  group('AuthUserModel', () {
    test('only SUPER_ADMIN is allowed', () {
      const admin = AuthUserModel(id: '1', fullName: 'Admin', role: 'SUPER_ADMIN');
      const manager = AuthUserModel(id: '2', fullName: 'Mgr', role: 'MANAGER');
      expect(admin.isSuperAdmin, isTrue);
      expect(manager.isSuperAdmin, isFalse);
      expect(admin.homeRoute, '/dashboard');
    });
  });

  testWidgets('LoginScreen shows control branding and form', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    expect(find.text(AppStrings.loginTitle), findsOneWidget);
    expect(find.text(AppStrings.login), findsOneWidget);
    expect(find.text(AppStrings.requiredBackendClient), findsOneWidget);
  });

  testWidgets('Dashboard shows placeholder metrics, not fake data', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => _FakeAuthNotifier()),
        ],
        child: MaterialApp(
          theme: AppTheme.light,
          home: const Scaffold(body: DashboardScreen()),
        ),
      ),
    );

    expect(find.text(AppStrings.dashboardTitle), findsOneWidget);
    expect(find.byType(PlaceholderBanner), findsOneWidget);
    expect(find.text(AppStrings.placeholderBadge), findsOneWidget);
    expect(find.text('—'), findsWidgets);
  });

  testWidgets('compact vs wide breakpoints', (tester) async {
    await tester.binding.setSurfaceSize(const Size(390, 844));
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(size: Size(390, 844)),
        child: Builder(
          builder: (context) {
            expect(Breakpoints.isCompact(context), isTrue);
            expect(Breakpoints.isWide(context), isFalse);
            return const SizedBox.shrink();
          },
        ),
      ),
    );

    await tester.binding.setSurfaceSize(const Size(1280, 800));
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(size: Size(1280, 800)),
        child: Builder(
          builder: (context) {
            expect(Breakpoints.isCompact(context), isFalse);
            expect(Breakpoints.isWide(context), isTrue);
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  });
}

class _FakeAuthNotifier extends AuthNotifier {
  @override
  Future<AuthUserModel?> build() async {
    return const AuthUserModel(
      id: 'test-admin',
      fullName: 'Test Admin',
      email: 'admin@test.local',
      role: 'SUPER_ADMIN',
    );
  }
}
