import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/diagnostics/probe_result.dart';

void main() {
  group('ProbeResult', () {
    test('comparisonLine includes kind, status, duration, alpn', () {
      final r = ProbeResult(
        probeKind: 'http_client_health',
        ok: true,
        elapsedMs: 120,
        httpStatus: 200,
        negotiatedAlpn: 'http/1.1',
        phaseTimingsMs: const {
          'openUrl_ms': 40,
          'headers_ms': 50,
          'body_ms': 30,
        },
      );
      final line = r.comparisonLine;
      expect(line, contains('probe=http_client_health'));
      expect(line, contains('ok=true'));
      expect(line, contains('http=200'));
      expect(line, contains('elapsedMs=120'));
      expect(line, contains('alpn=http/1.1'));
      expect(line, contains('openUrl_ms=40'));
      expect(line, isNot(contains('password')));
      expect(line.toLowerCase(), isNot(contains('bearer')));
    });

    test('null ALPN reported as null/not negotiated without guessing', () {
      final r = ProbeResult(
        probeKind: 'dio_health',
        ok: false,
        elapsedMs: 60000,
        negotiatedAlpn: null,
        errorType: 'DioException',
        errorMessage: 'receiveTimeout waiting_response_headers',
      );
      expect(r.negotiatedAlpnLabel, 'null/not negotiated');
      expect(r.comparisonLine, contains('alpn=null/not negotiated'));
      expect(r.comparisonLine, contains('errorType=DioException'));
      expect(r.comparisonLine, contains('receiveTimeout'));
      expect(r.comparisonLine, isNot(contains('http/1.1')));
    });

    test('failure line keeps errno-like detail and omits secrets', () {
      final r = ProbeResult(
        probeKind: 'dns_tls',
        ok: false,
        elapsedMs: 900,
        negotiatedAlpn: null,
        errorType: 'SocketException',
        errorMessage: 'osErrorCode=111 Connection refused token=secret-value',
      );
      final line = r.comparisonLine;
      expect(line, contains('osErrorCode=111'));
      expect(line, contains('Connection refused'));
      // password/token kv redaction
      expect(line.toLowerCase(), isNot(contains('secret-value')));
    });
  });
}
