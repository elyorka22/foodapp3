import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:control_mobile/core/diagnostics/diagnostic_classifier.dart';
import 'package:control_mobile/core/diagnostics/diagnostic_event.dart';
import 'package:control_mobile/core/diagnostics/diagnostic_log.dart';
import 'package:control_mobile/core/diagnostics/diagnostic_sanitizer.dart';
import 'package:control_mobile/core/l10n/app_strings.dart';
import 'package:control_mobile/core/router/routes.dart';
import 'package:control_mobile/features/auth/presentation/login_screen.dart';
import 'package:control_mobile/features/diagnostics/presentation/diagnostics_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    DiagnosticLog.instance.clear();
    final prefs = await SharedPreferences.getInstance();
    await DiagnosticLog.instance.attachPrefs(prefs);
  });

  group('DiagnosticSanitizer', () {
    test('redacts bearer, jwt, password kv, email, phone', () {
      final raw =
          'Bearer eyJhbGciOiJIUzI1NiJ9.aaa.bbb password=Secret123! '
          'user@example.com +998901234567';
      final clean = DiagnosticSanitizer.sanitize(raw);
      expect(clean.toLowerCase(), isNot(contains('secret123')));
      expect(clean, isNot(contains('eyJ')));
      expect(clean, isNot(contains('user@example.com')));
      expect(clean, isNot(contains('901234567')));
      expect(clean, contains('***'));
    });

    test('payloadFieldNames lists keys only', () {
      final names = DiagnosticSanitizer.payloadFieldNames({
        'email': 'a@b.c',
        'password': 'x',
        'client': 'control',
      });
      expect(names, 'client,email,password');
      expect(names, isNot(contains('a@b.c')));
    });
  });

  group('DiagnosticClassifier', () {
    test('receiveTimeout => headersNotReceived', () {
      final err = DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        type: DioExceptionType.receiveTimeout,
      );
      expect(
        DiagnosticClassifier.fromDio(err),
        DiagnosticFailureClass.headersNotReceived,
      );
      expect(
        DiagnosticClassifier.label(DiagnosticFailureClass.headersNotReceived),
        contains('headers not received'),
      );
    });

    test('HTTP 401/403 are client errors not timeout', () {
      DioException bad(int status) => DioException(
            requestOptions: RequestOptions(path: '/auth/login'),
            response: Response(
              requestOptions: RequestOptions(path: '/auth/login'),
              statusCode: status,
            ),
            type: DioExceptionType.badResponse,
          );
      expect(
        DiagnosticClassifier.fromDio(bad(401)),
        DiagnosticFailureClass.httpClientError,
      );
      expect(
        DiagnosticClassifier.fromDio(bad(403)),
        DiagnosticFailureClass.httpClientError,
      );
    });

    test('401 with receiveTimeout type still classified as HTTP client error', () {
      final err = DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: 401,
        ),
        type: DioExceptionType.receiveTimeout,
      );
      expect(
        DiagnosticClassifier.fromDio(err),
        DiagnosticFailureClass.httpClientError,
      );
    });
  });

  group('DiagnosticLog bounds', () {
    test('keeps at most maxMemoryEvents', () {
      for (var i = 0; i < DiagnosticLog.maxMemoryEvents + 50; i++) {
        DiagnosticLog.instance.log(
          requestId: 't',
          stage: 's',
          message: 'm$i',
        );
      }
      expect(
        DiagnosticLog.instance.events.length,
        DiagnosticLog.maxMemoryEvents,
      );
    });

    test('formatted export includes stages and response completion markers', () {
      DiagnosticLog.instance.log(
        requestId: 'r1',
        stage: 'adapter_headers',
        message: 'status=201 contentLength=403',
        elapsedMs: 12,
      );
      DiagnosticLog.instance.log(
        requestId: 'r1',
        stage: 'adapter_body_done',
        message: 'status=201 bytes=403',
        elapsedMs: 20,
      );
      final text = DiagnosticLog.instance.exportText();
      expect(text, contains('adapter_headers'));
      expect(text, contains('adapter_body_done'));
      expect(text, contains('status=201'));
      expect(text.toLowerCase(), isNot(contains('password')));
    });

    test('event formatting includes request id and elapsed', () {
      final e = DiagnosticEvent(
        at: DateTime.utc(2026, 10, 16, 12),
        requestId: 'r9',
        stage: 'login_start',
        message: 'ok',
        elapsedMs: 5,
      );
      expect(e.formattedLine, contains('#r9'));
      expect(e.formattedLine, contains('+5ms'));
      expect(e.formattedLine, contains('login_start'));
    });
  });

  group('Diagnostics UI', () {
    testWidgets('login screen shows diagnostics entry point', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: LoginScreen()),
        ),
      );
      expect(find.text(AppStrings.diagOpen), findsOneWidget);
      expect(find.text(AppRoutes.diagnostics), findsNothing);
    });

    testWidgets('diagnostics screen is usable before login', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: DiagnosticsScreen()),
        ),
      );
      expect(find.text(AppStrings.diagTitle), findsOneWidget);
      expect(find.text(AppStrings.diagHealth), findsOneWidget);
      expect(find.text(AppStrings.diagRetryLogin), findsOneWidget);
      expect(find.textContaining('API:'), findsOneWidget);
    });
  });
}
