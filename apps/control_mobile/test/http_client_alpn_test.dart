@TestOn('vm')
library;

import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/network/http_adapter_io.dart';

void main() {
  group('Control HttpClient ALPN', () {
    test('advertises http/1.1 only (not h2)', () {
      expect(kControlClientAlpnProtocols, equals(['http/1.1']));
      expect(kControlClientAlpnProtocols, isNot(contains('h2')));
    });

    test('createControlSecurityContext applies client ALPN without throwing', () {
      final ctx = createControlSecurityContext();
      expect(ctx, isA<SecurityContext>());
      // Re-applying the same client ALPN list must remain valid.
      expect(
        () => ctx.setAlpnProtocols(kControlClientAlpnProtocols, false),
        returnsNormally,
      );
    });

    test('createControlHttpClient builds a closable HttpClient', () {
      final client = createControlHttpClient();
      expect(client, isA<HttpClient>());
      client.close(force: true);
    });

    test('configureNativeHttpClient sets adapter kind for this platform', () {
      final dio = Dio();
      configureNativeHttpClient(dio);
      expect(controlNativeHttpAdapterInstalled, isTrue);
      if (Platform.isAndroid) {
        expect(controlHttpAdapterKind, 'native_cronet');
      } else {
        expect(controlHttpAdapterKind, 'custom_io_alpn');
      }
      dio.close(force: true);
    });
  });
}
