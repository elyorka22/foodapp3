@TestOn('vm')
library;

import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/diagnostics/diagnostic_classifier.dart';
import 'package:control_mobile/core/diagnostics/native_error_formatter.dart';

void main() {
  group('NativeErrorFormatter', () {
    test('includes HttpException.message and uri host/path', () {
      final err = HttpException(
        'Connection closed before full header was received',
        uri: Uri.parse('https://foodapp.uz/api/v1/health'),
      );
      final text = NativeErrorFormatter.describe(
        err,
        host: 'foodapp.uz',
        path: '/api/v1/health',
        stage: 'waiting_response_headers',
        elapsedMs: 28450,
        alpnAdvertised: 'http/1.1',
      );
      expect(text, contains('HttpException'));
      expect(text, contains('Connection closed before full header was received'));
      expect(text, contains('host=foodapp.uz'));
      expect(text, contains('path=/api/v1/health'));
      expect(text, contains('elapsedMs=28450'));
      expect(text, contains('failStage=waiting_response_headers'));
      expect(text, contains('alpnAdvertised=http/1.1'));
      expect(text, contains('not_exposed_by_HttpClient'));
      expect(text.toLowerCase(), isNot(contains('password')));
    });

    test('includes SocketException osError code and message', () {
      final err = SocketException(
        'Connection failed',
        osError: const OSError('Connection timed out', 110),
      );
      final text = NativeErrorFormatter.describe(err, stage: 'connecting');
      expect(text, contains('SocketException'));
      expect(text, contains('osErrorCode=110'));
      expect(text, contains('Connection timed out'));
      expect(
        NativeErrorFormatter.classifyObject(err),
        DiagnosticFailureClass.tcp,
      );
    });

    test('describes nested DioException.error HttpException', () {
      final nested = HttpException(
        'Software caused connection abort',
        uri: Uri.parse('https://foodapp.uz/api/v1/auth/login'),
      );
      final dio = DioException(
        requestOptions: RequestOptions(
          path: '/auth/login',
          baseUrl: 'https://foodapp.uz/api/v1',
        ),
        type: DioExceptionType.unknown,
        error: nested,
        message: 'wrapped',
      );
      final text = NativeErrorFormatter.describe(
        dio,
        host: 'foodapp.uz',
        path: '/api/v1/auth/login',
      );
      expect(text, contains('dioType=DioExceptionType.unknown'));
      expect(text, contains('causeType=HttpException'));
      expect(text, contains('Software caused connection abort'));
      expect(
        NativeErrorFormatter.inferFailStage(dio),
        'request_or_headers',
      );
    });

    test('receiveTimeout infers waiting_response_headers', () {
      final dio = DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        type: DioExceptionType.receiveTimeout,
      );
      expect(
        NativeErrorFormatter.inferFailStage(dio),
        'waiting_response_headers',
      );
      expect(
        NativeErrorFormatter.classifyObject(dio),
        DiagnosticFailureClass.headersNotReceived,
      );
    });

    test('HandshakeException classified as tls', () {
      const err = HandshakeException('Handshake error in client');
      final text = NativeErrorFormatter.describe(err);
      expect(text, contains('HandshakeException'));
      expect(text, contains('Handshake error in client'));
      expect(
        NativeErrorFormatter.classifyObject(err),
        DiagnosticFailureClass.tls,
      );
      expect(NativeErrorFormatter.inferFailStage(err), 'tls_handshake');
    });
  });
}
